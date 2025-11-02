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
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusText = document.getElementById('status');
const progressBar = document.getElementById('progressBar');

// Upload function with progress
uploadBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) {
    statusText.textContent = "Please select a file!";
    return;
  }

  const storageRef = ref(storage, `uploads/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      // Calculate progress
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressBar.style.width = progress + '%';
      progressBar.textContent = Math.round(progress) + '%';
    }, 
    (error) => {
      statusText.textContent = `Error: ${error}`;
      console.error(error);
    }, 
    () => {
      // Upload completed successfully
      getDownloadURL(uploadTask.snapshot.ref).then((url) => {
        statusText.textContent = `Upload successful! File URL: ${url}`;
        console.log("File URL:", url);
      });
    }
  );
});
