import os
import cv2
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from model import main as train_model  # Import the main function from model.py
from showcase import main as verify_image  # Import the main function from showcase.py

app = Flask(__name__)
CORS(app)  # Enable CORS on all routes

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['FACES_FOLDER'] = 'faces'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100 MB max file size

@app.before_request
def create_upload_folder():
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    if not os.path.exists(app.config['FACES_FOLDER']):
        os.makedirs(app.config['FACES_FOLDER'])

@app.route('/users/uploadVideo', methods=['POST'])
def upload_video():
    user_id = request.form.get('userId')
    video_file = request.files.get('file')

    if not user_id or not video_file:
        return jsonify(error="User ID and video file are required"), 400

    try:
        filename = secure_filename(f"{user_id}.mp4")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        video_file.save(file_path)

        # Call the function to extract faces from the video
        output_dir = os.path.join(app.config['FACES_FOLDER'], user_id)
        face_count = split_video_into_faces(file_path, output_dir, frame_rate=10)

        if face_count < 249:
            return jsonify(error="The video quality is not good enough, please provide a better/longer video."), 400

        # Train the model for the specific user
        train_model(user_id)

        return jsonify(message="Video uploaded and processed successfully", videoUrl=file_path, facesUrl=output_dir), 200
    except Exception as e:
        print(e)
        return jsonify(error="Video could not be uploaded"), 400

@app.route('/users/uploadImage', methods=['POST'])
def upload_image():
    user_id = request.form.get('userId')
    image_file = request.files.get('file')

    if not user_id or not image_file:
        return jsonify(error="User ID and image file are required"), 400

    try:
        filename = secure_filename(image_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(file_path)

        # Verify the image against the user's model
        result = verify_image(user_id, file_path)

        # Check if the user ID matches and confidence is greater than 0.9
        if result.get('success') and result.get('message', '').startswith(f"Image matches the class {user_id}") and result.get('confidence', 0) > 0.9:
            return jsonify(message="Redirect to Home", success=True), 200

        return jsonify(result), 400
    except Exception as e:
        print(e)
        return jsonify(error="Image could not be uploaded or processed"), 400


def split_video_into_faces(video_path, output_dir, frame_rate=150):
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load the Haar Cascade for face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return 0

    # Get the original frame rate of the video
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    
    if original_fps <= 0:
        print(f"Error: Invalid frame rate {original_fps} for video {video_path}")
        return 0
    
    if frame_rate <= 0:
        print(f"Error: Frame rate must be greater than zero")
        return 0

    frame_count = 0
    face_count = 0
    max_faces = 250  # Maximum number of faces to extract

    while True:
        # Read a frame
        ret, frame = cap.read()

        # If the frame was not retrieved properly, break the loop
        if not ret:
            break

        # Check if the current frame should be processed based on the desired frame rate
        if frame_count % max(1, int(original_fps // frame_rate)) == 0:
            # Convert frame to grayscale as face detection works on grayscale images
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # Detect faces
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,  # How much the image size is reduced at each image scale
                minNeighbors=15,  # How many neighbors each candidate rectangle should have to retain it
                minSize=(64, 64),  # Minimum possible object size
                flags=cv2.CASCADE_SCALE_IMAGE
            )

            for (x, y, w, h) in faces:
                # Crop the face region
                face = frame[y:y+h, x:x+w]
                
                # Construct the output face file path
                face_filename = os.path.join(output_dir, f"face_{face_count:04d}.jpg")
                
                # Save the face image
                cv2.imwrite(face_filename, face)
                face_count += 1

                # Stop if we have reached the maximum number of faces
                if face_count >= max_faces:
                    cap.release()
                    print(f"Extracted {face_count} faces to {output_dir}")
                    return face_count

        frame_count += 1

    # Release the video capture object
    cap.release()
    print(f"Extracted {face_count} faces to {output_dir}")
    return face_count

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
