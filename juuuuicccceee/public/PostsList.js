import React, { useState, useEffect } from "react";

const PostsList = () => {
  const [posts, setPosts] = useState([]);

  // Fetch posts from the API on component mount
  useEffect(() => {
    fetch("http://localhost:3000/api/posts")
      .then((response) => response.json())
      .then((data) => setPosts(data.posts))
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  return (
    <div className="posts-container">
      <h1>Posts</h1>
      <ul className="posts-list">
        {posts.map((post) => (
          <li key={post.id} className="post-item">
            <h2 className="post-title">{post.title}</h2>
            <p className="post-content">{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostsList;

