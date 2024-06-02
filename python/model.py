import numpy as np
import tensorflow as tf
import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.utils import Sequence
from tensorflow.keras import layers, models, regularizers
import matplotlib.pyplot as plt
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from PIL import Image
from collections import Counter

def custom_augmentation(image):
    image = tf.image.random_brightness(image, max_delta=0.2)
    image = tf.image.random_contrast(image, lower=0.5, upper=0.7)
    image = tf.image.random_flip_left_right(image)
    return image

# Data augmentation setup
data_augmentation = ImageDataGenerator(
    width_shift_range=0.2,
    height_shift_range=0.2,
    rotation_range=30,
    zoom_range=0.2,
    horizontal_flip=True,
    preprocessing_function=custom_augmentation
)

# Load the CelebA dataset from local directory
def load_celeba_data(img_dir, identity_file, target_size=(64, 64)):
    with open(identity_file, 'r') as f:
        lines = f.readlines()
    
    images = []
    identities = []
    for line in lines:
        img_name, identity = line.strip().split()
        img_path = os.path.join(img_dir, img_name)
        img = Image.open(img_path).resize(target_size)
        img = np.array(img)
        if img.shape == (64, 64, 3):
            images.append(img)
            identities.append(identity)
    
    images = np.array(images).astype('float32') / 255.0
    identities = np.array(identities)
    
    return images, identities

# Paths to the CelebA dataset
img_dir = 'C:/Users/grego/Desktop/'  # Replace with the path to the CelebA images directory
identity_file = 'C:/Users/Miha/Desktop/racunaalinski vid/facerecogntion/identity_CelebA.txt'  # Replace with the path to the identity_CelebA.txt file

# Load images and identities
images, identities = load_celeba_data(img_dir, identity_file)

# Encode labels (identities)
label_encoder = LabelEncoder()
labels = label_encoder.fit_transform(identities)

# Filter out classes with fewer than 2 samples
label_counts = Counter(labels)
filtered_indices = [i for i, label in enumerate(labels) if label_counts[label] > 1]

filtered_images = images[filtered_indices]
filtered_labels = labels[filtered_indices]

# Number of classes after filtering
num_classes = len(set(filtered_labels))

# Split data into training, validation, and test sets
train_images, test_images, train_labels, test_labels = train_test_split(filtered_images, filtered_labels, test_size=0.2, stratify=filtered_labels)
val_images, test_images, val_labels, test_labels = train_test_split(test_images, test_labels, test_size=0.5, stratify=test_labels)

# Data generator class for efficient data loading
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

# Model architecture with increased complexity and regularization
def create_model(kernel_size, num_classes):
    model = models.Sequential()
    
    model.add(layers.Input(shape=(train_images.shape[1], train_images.shape[2], train_images.shape[3])))
    model.add(layers.Conv2D(32, kernel_size, activation='relu', padding='same', kernel_regularizer=regularizers.l2(0.001)))
    model.add(layers.BatchNormalization())
    model.add(layers.Conv2D(32, kernel_size, activation='relu', padding='same', kernel_regularizer=regularizers.l2(0.001)))
    model.add(layers.BatchNormalization())
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Dropout(0.25))
    
    model.add(layers.Conv2D(64, kernel_size, activation='relu', padding='same', kernel_regularizer=regularizers.l2(0.001)))
    model.add(layers.BatchNormalization())
    model.add(layers.Conv2D(64, kernel_size, activation='relu', padding='same', kernel_regularizer=regularizers.l2(0.001)))
    model.add(layers.BatchNormalization())
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Dropout(0.25))
    
    model.add(layers.Conv2D(128, kernel_size, activation='relu', padding='same', kernel_regularizer=regularizers.l2(0.001)))
    model.add(layers.BatchNormalization())
    model.add(layers.Conv2D(128, kernel_size, activation='relu', padding='same', kernel_regularizer=regularizers.l2(0.001)))
    model.add(layers.BatchNormalization())
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Dropout(0.25))
    
    model.add(layers.Flatten())
    model.add(layers.Dense(256, activation='relu', kernel_regularizer=regularizers.l2(0.001)))
    model.add(layers.Dropout(0.5))
    model.add(layers.Dense(num_classes, activation='softmax'))
    
    return model

# Function to train and evaluate the model
def train_and_evaluate_model(model, train_gen, val_gen, test_images, test_labels):
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    
    history = model.fit(train_gen, epochs=50, validation_data=val_gen, 
                        callbacks=[
                            EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
                            ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=0.0001),
                            ModelCheckpoint('best_model.keras', monitor='val_loss', save_best_only=True)
                        ])
    
    model.load_weights('best_model.keras')
    _, test_acc = model.evaluate(test_images, test_labels)
    
    return history, test_acc

# Instantiate data generators
train_gen = DataGenerator(train_images, train_labels, augment=True)
val_gen = DataGenerator(val_images, val_labels, augment=False)

# Training and evaluating the model with different kernel sizes
kernel_sizes = [(3, 3)]
accuracies = {}

for kernel_size in kernel_sizes:
    model = create_model(kernel_size, num_classes)
    history, test_acc = train_and_evaluate_model(model, train_gen, val_gen, test_images, test_labels)
    accuracies[kernel_size] = test_acc
    
    model.save(f'trained_model_{kernel_size[0]}x{kernel_size[1]}.keras')

    results_df = pd.DataFrame({
        'Epoch': range(1, len(history.history['accuracy']) + 1),
        'Train Accuracy': history.history['accuracy'],
        'Validation Accuracy': history.history['val_accuracy'],
        'Train Loss': history.history['loss'],
        'Validation Loss': history.history['val_loss']
    })

    results_df.to_csv(f'model_training_results_{kernel_size[0]}x{kernel_size[1]}.csv', index=False)

print("Final Test Accuracies for different kernel sizes:")
for kernel_size, acc in accuracies.items():
    print(f"Kernel Size {kernel_size}: Test Accuracy = {acc:.4f}")
