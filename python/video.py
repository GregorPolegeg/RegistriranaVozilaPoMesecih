import cv2
import os

def split_video_into_faces(video_path, output_dir, frame_rate=1):
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load the Haar Cascade for face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return

    # Get the original frame rate of the video
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    
    if original_fps <= 0:
        print(f"Error: Invalid frame rate {original_fps} for video {video_path}")
        return
    
    if frame_rate <= 0:
        print(f"Error: Frame rate must be greater than zero")
        return

    frame_count = 0
    face_count = 0

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

        frame_count += 1

    # Release the video capture object
    cap.release()
    print(f"Extracted {face_count} faces to {output_dir}")

# Example usage
video_path = 'C:/Users/grego/Desktop/gregor.mp4'
output_dir = 'C:/Users/grego/Desktop/faces'
frame_rate = 10  # Process 10 frames per second
split_video_into_faces(video_path, output_dir, frame_rate)