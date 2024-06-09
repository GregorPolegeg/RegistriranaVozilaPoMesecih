import os
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.utils import Sequence
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from collections import Counter

def custom_augmentation(image):
    image = tf.image.random_brightness(image, max_delta=0.2)
    image = tf.image.random_contrast(image, lower=0.5, upper=0.7)
    return image

data_augmentation = ImageDataGenerator(
    width_shift_range=0.2,
    height_shift_range=0.2,
    rotation_range=20,
    zoom_range=0.2,
    preprocessing_function=custom_augmentation
)

def fetch_image_data(user_directory, unknown_directory):
    images = []
    labels = []
    
    for directory in [user_directory, unknown_directory]:
        class_label = os.path.basename(directory)
        image_files = filter(lambda f: f.endswith(('.jpg', '.png', '.jpeg')), os.listdir(directory))
        
        for image_file in image_files:
            full_image_path = os.path.join(directory, image_file).replace('\\', '/')
            image = tf.keras.preprocessing.image.load_img(full_image_path, target_size=(64, 64), color_mode='grayscale')
            image = tf.keras.preprocessing.image.img_to_array(image) / 255.0
            images.append(image)
            labels.append(class_label)
        
    return np.array(images), np.array(labels)

class DataGenerator(Sequence):
    def __init__(self, images, labels, batch_size=32, augment=False, **kwargs):
        super().__init__(**kwargs)
        self.images = images
        self.labels = labels
        self.batch_size = batch_size
        self.augment = augment
        self.indices = np.arange(len(images))
        self.on_epoch_end()
        
    def __len__(self):
        return int(np.floor(len(self.images) / self.batch_size))
    
    def __getitem__(self, index):
        indices = self.indices[index*self.batch_size:(index+1)*self.batch_size]
        batch_images = [self.images[i] for i in indices]
        batch_labels = [self.labels[i] for i in indices]
        
        if self.augment:
            batch_images = np.array([data_augmentation.random_transform(img) for img in batch_images])
        
        return np.array(batch_images), np.array(batch_labels)
    
    def on_epoch_end(self):
        np.random.shuffle(self.indices)

def create_model(kernel_size, num_classes):
    model = models.Sequential()
    
    model.add(layers.Input(shape=(64, 64, 1)))
    model.add(layers.Conv2D(32, kernel_size, activation='gelu', padding='same'))
    model.add(layers.Conv2D(32, kernel_size, activation='gelu', padding='same'))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Dropout(0.25))
    
    model.add(layers.Conv2D(64, kernel_size, activation='gelu', padding='same'))
    model.add(layers.Conv2D(64, kernel_size, activation='gelu', padding='same'))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Dropout(0.25))
    
    model.add(layers.Conv2D(128, kernel_size, activation='gelu', padding='same'))
    model.add(layers.Conv2D(128, kernel_size, activation='gelu', padding='same'))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Dropout(0.25))
    
    model.add(layers.Flatten())
    model.add(layers.Dense(128, activation='tanh'))
    model.add(layers.Dense(num_classes, activation='softmax'))
    
    return model

def train_and_evaluate_model(model, train_gen, val_gen, test_images, test_labels):
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    
    history = model.fit(train_gen, epochs=20, validation_data=val_gen, 
                        callbacks=[EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True), 
                                   ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=0.0001)])
    
    _, test_acc = model.evaluate(test_images, test_labels)
    
    return history, test_acc

def main(user_id):
    base_directory = 'C:/Users/jasst/Desktop/spletek/RegistriranaVozilaPoMesecih/python/faces'
    user_directory = os.path.join(base_directory, user_id)
    unknown_directory = os.path.join(base_directory, 'unknown')

    # Ensure the directories exist
    if not os.path.isdir(user_directory) or not os.path.isdir(unknown_directory):
        raise ValueError("User directory or unknown directory does not exist")

    kernel_sizes = [(3, 3)]
    
    train_images, train_labels = fetch_image_data(user_directory, unknown_directory)

    label_encoder = {label: idx for idx, label in enumerate(np.unique(train_labels))}
    train_labels = np.array([label_encoder[label] for label in train_labels])

    # Check data balance
    print(f"Class distribution in training data for user {user_id}:", Counter(train_labels))

    train_images, val_images, train_labels, val_labels = train_test_split(
        train_images, train_labels, test_size=0.2, stratify=train_labels)

    train_images = train_images.reshape(-1, 64, 64, 1)
    val_images = val_images.reshape(-1, 64, 64, 1)

    train_gen = DataGenerator(train_images, train_labels, augment=True)
    val_gen = DataGenerator(val_images, val_labels, augment=False)

    accuracies = {}

    for kernel_size in kernel_sizes:
        model = create_model(kernel_size, len(np.unique(train_labels)))
        history, test_acc = train_and_evaluate_model(model, train_gen, val_gen, val_images, val_labels)
        accuracies[kernel_size] = test_acc
        
        model.save(f'{user_directory}_face_model.keras')

    # Print final accuracies
    print(f"Final Test Accuracies for different kernel sizes for user {user_id}:")
    for kernel_size, acc in accuracies.items():
        print(f"Kernel Size {kernel_size}: Test Accuracy = {acc:.4f}")

    # Evaluate on known data
    print(f"\nEvaluating on known training data for user {user_id}:")
    for i in range(5):
        test_image = train_images[i].reshape(1, 64, 64, 1)
        prediction = model.predict(test_image)
        print(f"True label: {train_labels[i]}, Predicted label: {np.argmax(prediction)}, Confidence: {np.max(prediction)}")
