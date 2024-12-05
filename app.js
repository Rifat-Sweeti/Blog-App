import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-uVSquBfu15sgRBg3MNUOTW6xOD9Pk6o",
  authDomain: "social-app-dcab9.firebaseapp.com",
  projectId: "social-app-dcab9",
  storageBucket: "social-app-dcab9.firebasestorage.app",
  messagingSenderId: "1050289692340",
  appId: "1:1050289692340:web:5269279a96ba1ff17e41e1",
  measurementId: "G-VEZHK9QP69",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// DOM Elements
const authButton = document.getElementById("authButton");
const mainContent = document.getElementById("mainContent");
const postBlogButton = document.getElementById("postBlog");
const blogsContainer = document.getElementById("blogsContainer");
const searchBar = document.getElementById("searchBar");

let currentUser = null;

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    authButton.textContent = "Logout";
    loadBlogs();
  } else {
    currentUser = null;
    authButton.textContent = "Login";
    loadBlogs();
  }
});

// Post Blog
postBlogButton.addEventListener("click", async () => {
  const title = document.getElementById("blogTitle").value;
  const content = document.getElementById("blogContent").value;
  const category = document.getElementById("blogCategory").value;

  if (!title || !content || !currentUser) {
    alert("Please fill in all fields and login first.");
    return;
  }

  const blogData = {
    title,
    content,
    category,
    author: currentUser.email,
    timestamp: new Date(),
  };

  await addDoc(collection(db, "blogs"), blogData);
  alert("Blog posted successfully!");
  loadBlogs();
});

// Load Blogs (with sorting by timestamp, showing recent first)
async function loadBlogs() {
  const blogsQuery = query(collection(db, "blogs"), orderBy("timestamp", "desc"));
  const blogsSnapshot = await getDocs(blogsQuery);
  blogsContainer.innerHTML = "<h2>All Blogs</h2>";

  blogsSnapshot.forEach((doc) => {
    const blog = doc.data();
    const blogElement = document.createElement("div");
    blogElement.classList.add("blog-post");

    blogElement.innerHTML = `
      <h3>${blog.title}</h3>
      <small>By: ${blog.author} | ${new Date(blog.timestamp.seconds * 1000).toLocaleString()}</small>
      <p>${blog.content}</p>
      <small>Category: ${blog.category}</small>
    `;

    // Show Edit/Delete buttons only if the current user is the author of the post
    if (currentUser && currentUser.email === blog.author) {
      blogElement.innerHTML += `
        <button onclick="editBlog('${doc.id}', '${blog.title}', '${blog.content}')">Edit</button>
        <button onclick="deleteBlog('${doc.id}')">Delete</button>
      `;
    }

    blogsContainer.appendChild(blogElement);
  });
}

// Edit Blog
window.editBlog = async (id, title, content) => {
  const newTitle = prompt("Edit Title:", title);
  const newContent = prompt("Edit Content:", content);

  if (newTitle && newContent) {
    const blogRef = doc(db, "blogs", id);
    await updateDoc(blogRef, { title: newTitle, content: newContent });
    alert("Blog updated successfully!");
    loadBlogs();
  }
};

// Delete Blog
window.deleteBlog = async (id) => {
  const confirmDelete = confirm("Are you sure you want to delete this blog?");
  if (confirmDelete) {
    await deleteDoc(doc(db, "blogs", id));
    alert("Blog deleted successfully!");
    loadBlogs();
  }
};

// Search Blogs
searchBar.addEventListener("input", async () => {
  const searchTerm = searchBar.value.toLowerCase();
  const blogsQuery = query(collection(db, "blogs"), orderBy("timestamp", "desc"));
  const blogsSnapshot = await getDocs(blogsQuery);
  blogsContainer.innerHTML = "<h2>Search Results</h2>";

  blogsSnapshot.forEach((doc) => {
    const blog = doc.data();
    if (blog.title.toLowerCase().includes(searchTerm) || blog.content.toLowerCase().includes(searchTerm)) {
      const blogElement = document.createElement("div");
      blogElement.classList.add("blog-post");

      blogElement.innerHTML = `
        <h3>${blog.title}</h3>
        <small>By: ${blog.author} | ${new Date(blog.timestamp.seconds * 1000).toLocaleString()}</small>
        <p>${blog.content}</p>
        <small>Category: ${blog.category}</small>
      `;
      blogsContainer.appendChild(blogElement);
    }
  });
});

// Auth Button (Login/Logout)
authButton.addEventListener("click", () => {
  if (currentUser) {
    signOut(auth);
  } else {
    const email = prompt("Enter email:");
    const password = prompt("Enter password:");
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => alert("Failed to login: " + error.message));
  }
});