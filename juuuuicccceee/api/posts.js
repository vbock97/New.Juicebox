const express = require("express");
const postsRouter = express.Router();

const { requireUser } = require("./utils");

const {
  createPost,
  getAllPosts,
  updatePost,
  getPostById,
  client,
} = require("../db");

postsRouter.get("/", async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      // the post is active, doesn't matter who it belongs to
      if (post.active) {
        return true;
      }

      // the post is not active, but it belogs to the current user
      if (req.user && post.author.id === req.user.id) {
        return true;
      }

      // none of the above are true
      return false;
    });

    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content = "", tags = [] } = req.body;

  const postData = {};

  try {
    postData.authorId = req.user.id;
    postData.title = title;
    postData.content = content;

    const post = await createPost(postData);

    if (post) {
      if (tags.length > 0) {
        const tagIds = await Promise.all(
          tags.map(async (tagName) => {
            let [tag] = await getTagByName(tagName);
            if (!tag) {
              tag = await createTags({ name: tagName });
            }
            return tag.id;
          })
        );
        await associateTagsWithPost(post.id, tagIds);
      }
      res.send(post);
    } else {
      next({
        name: "PostCreationError",
        message: "There was an error creating your post. Please try again.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user.id;
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      SELECT * FROM posts WHERE id = $1 AND author_id = $2;
      `,
      [postId, userId]
    );
    if (!post) {
      return next({
        name: "PostNotFoundError",
        message:
          "Post not found or you are not authorized to delete this post.",
      });
    }
    await client.query(
      `
      DELETE FROM posts WHERE id = $1;
      `,
      [postId]
    );
    res.status(200).send({ message: "Post deleted successfully" });
  } catch (error) {
    next({
      name: "DatabaseError",
      message: "There was an error deleting the post. Please try again later.",
    });
  }
});

module.exports = postsRouter;
