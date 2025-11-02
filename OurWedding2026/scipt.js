// Firebase Config (πάρε τα στοιχεία από το Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const status = document.getElementById("status");

uploadBtn.addEventListener("click", async () => {
  const files = fileInput.files;
  if (!files.length) {
    alert("Επίλεξε μια φωτογραφία πρώτα!");
    return;
  }

  status.innerText = "🔄 Ανέβασμα...";
  for (const file of files) {
    const storageRef = storage.ref().child(`uploads/${Date.now()}_${file.name}`);
    await storageRef.put(file);
  }

  status.innerText = "✅ Οι φωτογραφίες ανέβηκαν επιτυχώς!";
});
