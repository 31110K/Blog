import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useAuthStore } from "../store/useAuthStore.js";
import JoditEditor from "jodit-react";

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


import "react-toastify/dist/ReactToastify.css";

const EditPost = () => {
  const { postId } = useParams();
  const { authUser } = useAuthStore();

  const [post, setPost] = useState(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("publish");
  const [visibility, setVisibility] = useState("public");
  const [schedulePublish, setSchedulePublish] = useState(null);
  const [categories, setCategories] = useState([]);
  const [commentable, setCommentable] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSchedule, setIsSchedule] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCredit, setImageCredit] = useState("");
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const editorRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/host/getPost/${postId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const result = await res.json();
        if (result.success) {
          const data = result.data;
          setPost(data);
          setContent(data.content || "");
          setStatus(data.status || "publish");
          setVisibility(data.visibility || "public");
          setSchedulePublish(data.scheduledAt || null);
          setCategories(data.categories || []);
          setCommentable(data.isCommentable ?? true);
          setIsSchedule(data.status === "schedule");
        } else {
          toast.error(result.message || "Failed to fetch post.");
        }
      } catch (error) {
        toast.error("Internal server error");
        console.error("Fetch error:", error);
      }
    };

    if (postId) fetchPost();
  }, [postId]);

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setExcerpt(post.excerpt || "");
      setImageUrl(post.featuredImage?.url || "");
      setImageCredit(post.featuredImage?.credit || "");
      setTags(post.tags?.join(", ") || "");
      setMetaTitle(post.metaTitle || "");
      setMetaDescription(post.metaDescription || "");
    }
  }, [post]);

  const editPostHandler = async (e) => {
    e.preventDefault();
    setIsEditing(true);

    let publishedAt;
    let scheduledAt;
    if(status==="publish"){
      publishedAt= new Date();
      scheduledAt= null;
    } else if(status==="schedule"){
      publishedAt= null;
      scheduledAt= schedulePublish;
    } else {
      publishedAt= null;
      scheduledAt= null;
    }

    const updatedPost = {
      author: authUser?._id,
      title,
      excerpt,
      content,
      featuredImage: {
        url: imageUrl,
        credit: imageCredit,
      },
      status,
      visibility,
      publishedAt,
      scheduledAt,
      categories,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      metaTitle,
      metaDescription,
      isCommentable: commentable,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/api/host/updatePost/${postId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedPost),
        }
      );

      const result = await res.json();

      if (result.success) {
        setPost(result.data);
        toast.success("Post updated successfully");
      } else if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(result.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Internal server error");
    } finally {
      setIsEditing(false);
    }
  };

  if (!post) {
    return (
      <div className="centered-loader">
        <div style={{ width: "80%", maxWidth: 1800 }}>
          <Skeleton height={180} width="80%" />
          <Skeleton height={30} count={10} style={{ marginTop: 20 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="page">
        <main className="main">
          <header className="header">
            <h1 className="title">Edit Blog Post</h1>
          </header>

          <div className="user-info">
            <div className="user-avatar">
              {authUser?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <h3>{authUser?.name || "Guest"}</h3>
              <p>Author</p>
            </div>
          </div>

          <form onSubmit={editPostHandler}>
            <div className="post-form layout-split">
              <section className="post-content">
                <div className="card title-excerpt-card">
                  <div className="input-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Excerpt</label>
                    <textarea
                      rows="3"
                      value={excerpt}
                      onChange={e => setExcerpt(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="card editor-card">
                  <div className="input-group">
                    <label>Content *</label>
                    <div className="editor-wrapper">
                      <JoditEditor
                        ref={editorRef}
                        value={content}
                        onChange={() => {}} 
                        onBlur={(newContent) => setContent(newContent)} 
                        config={{
                          uploader: {
                            insertImageAsBase64URI: false,
                            url: "http://localhost:5000/api/host/upload",
                            format: "json",
                            withCredentials: true,
                            filesVariableName: "image", // <--- add this line
                            headers: {
                              Accept: "application/json",
                            },
                          },
                          allowDragAndDropFileToEditor: true,
                          height: 400,
                          toolbarAdaptive: true,
                          askBeforePasteHTML: false,
                          askBeforePasteFromWord: false,
                          defaultActionOnPaste: "insert_clear_html",
                          image: {
                            upload: true,
                            dragAndDrop: true,
                          },
                        }}
                      />
                      
                    </div>
                  </div>
                </div>

                <div className="card preview-box">
                  <h4>Live Preview</h4>
                  <div
                    className="preview-content"
                    dangerouslySetInnerHTML={{ __html: content }}
                  ></div>
                </div>
              </section>

              <section className="post-settings-wrapper">
                <aside className="post-settings card">
                  <div className="input-group">
                    <label>Featured Image URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      pattern="https?://.+\.(jpg|jpeg|png|gif|webp|svg)"
                      title="Please enter a direct image URL ending in .jpg, .jpeg, .png, .gif, .webp, or .svg"
                    />
                    <input
                      type="text"
                      placeholder="Image credit/source"
                      value={imageCredit}
                      onChange={e => setImageCredit(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="members-only">Members Only</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Status</label>
                    <select
                      value={status}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setStatus(selected);
                        setIsSchedule(selected === "schedule");
                      }}
                    >
                      <option value="draft">Draft</option>

                      <option value="publish">Publish</option>
                      <option value="schedule">Schedule</option>
                    </select>
                  </div>

                  {isSchedule && (
                    <div className="input-group">
                      <label>Schedule Publish</label>
                      <input
                        type="datetime-local"
                        value={schedulePublish || ""}
                        onChange={(e) => setSchedulePublish(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="input-group">
                    <label>Categories</label>
                    <select
                      multiple
                      value={categories}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions
                        ).map((opt) => opt.value);
                        setCategories(selected);
                      }}
                      className="categories"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Travel">Travel</option>
                      <option value="Food">Food</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Business">Business</option>
                    </select>
                    <small>Hold Ctrl/Cmd to select multiple</small>
                  </div>

                  <div className="input-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={e => setMetaTitle(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Meta Description</label>
                    <textarea
                      rows="3"
                      value={metaDescription}
                      onChange={e => setMetaDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="input-group checkbox">
                    <input
                      type="checkbox"
                      id="isCommentable"
                      checked={commentable}
                      onChange={(e) => setCommentable(e.target.checked)}
                    />
                    <label htmlFor="isCommentable">Allow Comments</label>
                  </div>
                </aside>
              </section>
            </div>

            <div className="button-group">
              <button type="submit" className="btn-secondary">
                {isEditing ? "Updating..." : "Update Post"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default EditPost;
