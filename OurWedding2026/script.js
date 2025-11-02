// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcfjf8mAaYjhsnYBA4QgjY1GhDiWvcT8k",
  authDomain: "ourwedding2026-eee5f.firebaseapp.com",
  projectId: "ourwedding2026-eee5f",
  storageBucket: "ourwedding2026-eee5f.appspot.com",
  messagingSenderId: "210532953767",
  appId: "1:210532953767:web:8bf8f99ac517265ede7582"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// DOM Elements
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusText = document.getElementById('status');
const progressBar = document.getElementById('progressBar');

let selectedFile = null;

// Click on drop area opens file selector
dropArea.addEventListener('click', () => fileInput.click());

// Handle file selection from input
fileInput.addEventListener('change', (e) => {
  selectedFile = e.target.files[0];
  statusText.textContent = selectedFile ? `Selected: ${selectedFile.name}` : '';
});

// Drag & drop events
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('hover');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('hover');
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('hover');
  if (e.dataTransfer.files.length > 0) {
    selectedFile = e.dataTransfer.files[0];
    statusText.textContent = `Selected: ${selectedFile.name}`;
  }
});

// Upload function
uploadBtn.addEventListener('click', () => {
  if (!selectedFile) {
    statusText.textContent = "Please select or drag a file!";
    return;
  }

  const storageRef = ref(storage, `uploads/${selectedFile.name}`);
  const uploadTask = uploadBytesResumable(storageRef, selectedFile);

  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressBar.style.width = progress + '%';
      progressBar.textContent = Math.round(progress) + '%';
    },
    (error) => {
      statusText.textContent = `Error: ${error}`;
      console.error(error);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((url) => {
        statusText.textContent = `Upload successful! File URL: ${url}`;
        console.log("File URL:", url);

        // Reset progress bar and selected file for next upload
        progressBar.style.width = '0%';
        progressBar.textContent = '';
        selectedFile = null;
        fileInput.value = ''; // Reset file input
      });
    }
  );
});
