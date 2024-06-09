import os
import sys
from matplotlib import pyplot as plt
import numpy as np
import tensorflow as tf
from tensorflow.keras import models
import cv2

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

# Define the visualization function
def display_image(image_path, model, class_labels, train_images_path, confidence_threshold=0.80):
    image = tf.keras.preprocessing.image.load_img(image_path, target_size=(64, 64), color_mode='grayscale')
    image = tf.keras.preprocessing.image.img_to_array(image)
    image /= 255.0  # Normalize the image
    
    image_expanded = np.expand_dims(image, axis=0)  # Add batch dimension
    prediction = model.predict(image_expanded)
    predicted_class = np.argmax(prediction)
    confidence = np.max(prediction)
    
    print(f"Prediction raw output: {prediction}")
    
    if confidence < confidence_threshold:
        return {"message": "Model is not confident enough to classify the image.", "success": False, "confidence": confidence}
    else:
        print(f"Predicted Class: {class_labels[predicted_class]}")
        print(f"Confidence: {confidence:.2f}")
        
        # Load a sample image from the predicted class
        sample_image = load_sample_image_from_class(train_images_path, class_labels[predicted_class])
        
        if sample_image is not None:
            return {"message": f"Image matches the class {class_labels[predicted_class]}.", "success": True, "confidence": confidence}
        else:
            return {"message": "No sample image found for comparison.", "success": False, "confidence": confidence}


def main(user_id, image_path):
    base_directory = r'faces'
    base_directory = os.path.abspath(base_directory)
    model_path = os.path.join(base_directory, f'{user_id}_face_model.keras')
    
    if not os.path.exists(model_path):
        return {"error": f"Model for user {user_id} does not exist.", "success": False}
    
    # Load the pre-trained model
    model = models.load_model(model_path)

    # Define class labels (update this list based on your actual class labels)
    class_labels = [user_id, "unknown"]  # Update based on your folder names
    
    output_dir = os.path.join(base_directory, user_id)
    face_image_path = split_image_into_faces(image_path, output_dir)

    if face_image_path:
        return display_image(face_image_path, model, class_labels, base_directory)
    else:
        return {"error": "No face image to display.", "success": False}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python showcase.py <user_id> <image_path>")
        sys.exit(1)
    user_id = sys.argv[1]
    image_path = sys.argv[2]
    result = main(user_id, image_path)
    print(result)
