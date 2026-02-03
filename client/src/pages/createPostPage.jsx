import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import "./cssfile/createPost.css";
const JoditEditor = lazy(() => import("jodit-react"));
import { useAuthStore } from "../store/useAuthStore.js";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatePost = () => {
  const { authUser } = useAuthStore();
  const editorRef = useRef(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCredit, setImageCredit] = useState("");
  const [status, setStatus] = useState("publish");
  const [visibility, setVisibility] = useState("public");
  const [schedulePublish, setSchedulePublish] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [commentable, setCommentable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, SetIsDraft] = useState(false);
  const [isSchedule, SetIsSchedule] = useState(false);
  // Chatbot UI state
  const [chatbotPrompt, setChatbotPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let publishedAt;
    let scheduledAt;
    if (status === "publish") {
      publishedAt = new Date();
      scheduledAt = null;
    } else if (status === "schedule") {
      publishedAt = null;
      scheduledAt = schedulePublish;
    } else {
      publishedAt = null;
      scheduledAt = null;
    }

    const postDetail = {
      author: authUser._id,
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
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      metaTitle,
      metaDescription,
      isCommentable: commentable,
    };

    const resetForm = () => {
      setTitle("");
      setExcerpt("");
      setTags("");
      setMetaTitle("");
      setMetaDescription("");
      setContent("");
      setStatus("draft");
      SetIsDraft(true);
      setVisibility("public");
      setSchedulePublish(null);
      setCategories([]);
      setCommentable(true);
      setImageUrl("");
      setImageCredit("");
    };

    try {
      console.log("Posting blog with details:", postDetail);
      const res = await fetch("https://blogging-82kn.onrender.com/api/host/createPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(postDetail),
      });

      const result = await res.json();
      console.log("response:", result);

      if (result.success) {
        if (isDraft) {
          toast(" Blog Successfully Saved!");
        } else {
          toast.success(" Blog Successfully Posted!");
        }
        resetForm();
      } else if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach((err) => toast.error(`❌ ${err}`));
      } else {
        toast.error(`❌ ${result.message || "Posting failed!"}`);
      }
    } catch (error) {
      console.error("Error while posting failed:", error);
      toast.error("❌ Something went wrong while posting the blog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChat = async () => {
    const prompt = chatbotPrompt.trim();
    if (!prompt) return;

    // append user message
    setChatMessages((m) => [...m, { sender: "user", text: prompt }]);
    setChatbotPrompt("");
    setIsChatLoading(true);

    try {
      // Try sending to a backend chatbot endpoint; fallback to stub response on failure
      const res = await fetch("https://blogging-82kn.onrender.com/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Chatbot endpoint responded with error");

      const data = await res.json();
      const reply = data?.reply || data?.message || "(no reply)";
      setChatMessages((m) => [...m, { sender: "bot", text: String(reply) }]);
    } catch (err) {
      setChatMessages((m) => [...m, { sender: "bot", text: "Chat backend not available — local stub reply." }]);
      console.error("Chat send error:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClear = () => {
    setChatMessages([]);
    setChatbotPrompt("");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="page">
        <main className="main">
          <header className="header">
            <h1 className="title">Create New Blog Post</h1>
          </header>

          <div className="user-info">
            <div className="user-avatar">
              {authUser?.name ? authUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-details">
              <h3>{authUser?.name || "Guest User"}</h3>
              <p>Author</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="post-form layout-split">
              <section className="post-content">
                <div className="card title-excerpt-card">
                  <div className="input-group">
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="Post title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                      </Suspense>
                  </div>
                  <div className="input-group">
                    <label>Excerpt</label>
                    <textarea
                      rows="3"
                      placeholder="Brief summary..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="card editor-card">
                  <div className="input-group">
                    <label>Content *</label>
                    <div className="editor-wrapper">
                      <Suspense fallback={<div>Loading editor…</div>}>
                        <JoditEditor
                          ref={editorRef}
                          value={content}
                          onChange={() => {}} 
                          onBlur={(newContent) => setContent(newContent)} 
                          config={{
                          uploader: {
                            insertImageAsBase64URI: false,
                            url: "https://blogging-82kn.onrender.com/api/host/upload",
                            format: "json",
                            filesVariableName: "image",
                            withCredentials: true,
                            headers: {
                              Accept: "application/json",
                              "Content-Type": "multipart/form-data",
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
                      onChange={(e) => setImageUrl(e.target.value)}
                      pattern="https?://.+\.(jpg|jpeg|png|gif|webp|svg)"
                      title="Please enter a direct image URL ending in .jpg, .jpeg, .png, .gif, .webp, or .svg"
                    />
                    <input
                      type="text"
                      placeholder="Image credit/source"
                      value={imageCredit}
                      onChange={(e) => setImageCredit(e.target.value)}
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
                      name="status"
                      value={status}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setStatus(selected);
                        SetIsDraft(selected === "draft");
                        SetIsSchedule(selected === "schedule");
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
                      placeholder="tag1, tag2, tag3"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Meta Title</label>
                    <input
                      type="text"
                      placeholder="SEO optimized title"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Meta Description</label>
                    <textarea
                      rows="3"
                      placeholder="SEO description"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="input-group checkbox">
                    <input
                      type="checkbox"
                      id="isCommentable"
                      defaultChecked
                      onChange={(e) => setCommentable(e.target.checked)}
                    />
                    <label htmlFor="isCommentable">Allow Comments</label>
                  </div>
                </aside>
              </section>
            </div>

            <div className="button-group">
              {isDraft ? (
                <button type="submit" className="btn-secondary">
                  {isSubmitting ? "Saving..." : "Save as Draft"}
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              )}
            </div>

            {/* Chatbot UI placed below the post button */}
            <div className="chatbot card">
              <div className="chatbot-header">
                <h4>Chatbot</h4>
                <p className="chat-sub">Ask the assistant to help draft or improve your post</p>
              </div>

              <div className="chat-window">
                {chatMessages.length === 0 && (
                  <div className="chat-empty">
                    <p className="muted">No messages yet. Try: "Write an intro paragraph for my post about React."</p>
                  </div>
                )}

                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={"chat-message-row " + (m.sender === "user" ? "row-user" : "row-bot")}
                  >
                    <div className="chat-avatar">{m.sender === "user" ? "👤" : "🤖"}</div>
                    <div className="chat-body">
                      <div className="chat-meta">
                        <span className="chat-sender">{m.sender === "user" ? "You" : "Assistant"}</span>
                        <time className="chat-time">{new Date(m.time || Date.now()).toLocaleTimeString()}</time>
                      </div>
                      <div className={"chat-bubble " + (m.sender === "user" ? "chat-bubble-user" : "chat-bubble-bot")}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                ))}

                <div ref={messageEndRef} />
              </div>

              <div className="chat-footer">
                <button type="button" className="btn-clear" onClick={handleClear}>
                  Clear all
                </button>

                <div className="chat-prompt-wrap">
                  <textarea
                    rows={1}
                    placeholder="Enter prompt for chatbot..."
                    value={chatbotPrompt}
                    onChange={(e) => setChatbotPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChat();
                      }
                    }}
                    className="chat-prompt"
                    aria-label="Chat prompt"
                  />
                </div>

                <button type="button" className="btn-generate" onClick={handleSendChat} disabled={isChatLoading}>
                  {isChatLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default CreatePost;
