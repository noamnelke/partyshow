from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, emit
import os
from urllib.parse import quote
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'

# Initialize SocketIO with asyncio
socketio = SocketIO(app)

# In-memory state management
photo_queue = []

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'heic', 'heif'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_existing_photos():
    """Load existing photos from the uploads folder into the photo_queue."""
    try:
        files = os.listdir(UPLOAD_FOLDER)
        # Filter allowed image files
        image_files = [f for f in files if allowed_file(f)]
        # Sort files by filename (assuming timestamp is prepended)
        image_files.sort()
        for filename in image_files:
            file_path = os.path.join(UPLOAD_FOLDER, filename).replace('\\', '/')
            photo = {'filename': filename, 'path': '/' + quote(file_path)}
            photo_queue.append(photo)
        print(f"Loaded {len(photo_queue)} existing photos into the queue.")
    except Exception as e:
        print(f"Error loading existing photos: {e}")

# Load existing photos on server startup
load_existing_photos()

@app.route('/')
def display():
    return render_template('display.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'photo' not in request.files:
            return redirect(request.url)
        file = request.files['photo']
        if file.filename == '':
            return redirect(request.url)
        if file and allowed_file(file.filename):
            # Prepend timestamp to filename to ensure uniqueness
            timestamp = int(time.time())
            filename, ext = os.path.splitext(file.filename)
            unique_filename = f"{timestamp}__{filename}{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename).replace('\\', '/')
            file.save(filepath)
            photo = {'filename': unique_filename, 'path': '/' + quote(filepath)}
            photo_queue.append(photo)
            emit('new_photo', photo, broadcast=True, namespace='/')
            return redirect(url_for('upload'))
        else:
            print("Invalid file type attempted to be uploaded.")
            return "Invalid file type.", 400
    return render_template('upload.html')

@app.route('/queue')
def queue():
    return {'photo_queue': photo_queue}

@socketio.on('connect', namespace='/')
def handle_connect():
    emit('initial_state', {'photo_queue': photo_queue})
    print("Client connected and initial state emitted.")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
