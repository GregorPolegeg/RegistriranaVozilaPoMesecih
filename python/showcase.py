import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import models
import matplotlib.pyplot as plt
import cv2

# Path to the pre-trained model
model_path = 'C:/Users/Miha/Desktop/racunaalinski vid/vaja5/face_model.keras'

def split_image_into_faces(image_path, output_dir):
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load the Haar Cascade for face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Read the image
    image = cv2.imread(image_path)
    
    if image is None:
        print(f"Error: Could not read image {image_path}")
        return None

    # Convert image to grayscale as face detection works on grayscale images
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,  # How much the image size is reduced at each image scale
        minNeighbors=10,  # How many neighbors each candidate rectangle should have to retain it
        minSize=(64, 64),  # Minimum possible object size
        flags=cv2.CASCADE_SCALE_IMAGE
    )

    for (x, y, w, h) in faces:
        # Crop the face region
        face = image[y:y+h, x:x+w]
        
        # Construct the output face file path
        face_filename = os.path.join(output_dir, "face.jpg")
        
        # Save the face image
        cv2.imwrite(face_filename, face)
        print(f"Extracted face to {face_filename}")
        return face_filename

    print("No face detected")
    return None

def load_sample_image_from_class(train_images_path, class_id):
    class_folder = os.path.join(train_images_path, class_id).replace('//', '/')
    for file_name in os.listdir(class_folder):
        if file_name.endswith(('.jpg', '.png', '.jpeg')):
            image_path = os.path.join(class_folder, file_name).replace('//', '/')
            image = tf.keras.preprocessing.image.load_img(image_path, target_size=(64, 64), color_mode='grayscale')
            image = tf.keras.preprocessing.image.img_to_array(image)
            image /= 255.0  # Normalize the image
            return image
    return None

# Load the pre-trained model
model = models.load_model(model_path)
model.summary()

# Define the visualization function
def display_image(image_path, model, class_labels, train_images_path, confidence_threshold=0.80):
    image = tf.keras.preprocessing.image.load_img(image_path, target_size=(64, 64), color_mode='grayscale')
    image = tf.keras.preprocessing.image.img_to_array(image)
    image /= 255.0  # Normalize the image
    
    plt.figure(figsize=(10, 5))
    
    # Plot the test image
    plt.subplot(1, 2, 1)
    plt.imshow(image.squeeze(), cmap='gray')
    plt.title('Test Image')
    
    image_expanded = np.expand_dims(image, axis=0)  # Add batch dimension
    prediction = model.predict(image_expanded)
    predicted_class = np.argmax(prediction)
    confidence = np.max(prediction)
    
    print(f"Prediction raw output: {prediction}")
    
    if confidence < confidence_threshold:
        print("Model is not confident enough to classify the image.")
        plt.subplot(1, 2, 2)
        plt.text(0.5, 0.5, 'Uncertain prediction', horizontalalignment='center', verticalalignment='center')
        plt.title('Prediction')
    else:
        print(f"Predicted Class: {class_labels[predicted_class]}")
        print(f"Confidence: {confidence:.2f}")
        
        # Load a sample image from the predicted class
        sample_image = load_sample_image_from_class(train_images_path, class_labels[predicted_class])
        
        # Plot the sample image from the predicted class
        plt.subplot(1, 2, 2)
        if sample_image is not None:
            plt.imshow(sample_image.squeeze(), cmap='gray')
            plt.title(f'Sample from Predicted Class: {class_labels[predicted_class]}')
        else:
            plt.text(0.5, 0.5, 'No sample image found', horizontalalignment='center', verticalalignment='center')
    
    plt.show()

# Define class labels (update this list based on your actual class labels)
class_labels = ["known", "unknown"]  # Update based on your folder names

# Example usage
image_path = 'C:/Users/Miha/Desktop/racunaalinski vid/vaja5/test.jpg'  # Update with your image path
output_dir = 'C:/Users/Miha/Desktop/racunaalinski vid/vaja5/faces'
face_image_path = split_image_into_faces(image_path, output_dir)

if face_image_path:
    display_image(face_image_path, model, class_labels, 'C:/Users/Miha/Desktop/racunaalinski vid/vaja5/faces')
else:
    print("No face image to display.")