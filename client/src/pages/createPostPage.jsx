import React, { useState, useRef } from 'react';
import './cssfile/createPost.css';
import JoditEditor from 'jodit-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreatePost = () => {
  const { authUser } = useAuthStore();
  const editorRef = useRef(null);
  const [content, setContent] = useState('');

  const titleRef = useRef(null);
  const excerptRef = useRef(null);
  const imageRef = useRef(null);
  const imageCreditRef = useRef(null);
  const [status, setStatus] = useState('publish');  
  const [visibility, setVisibility] = useState('public');
  const [publishDate, setPublishDate] = useState(null);
  const [schedulePublish, setSchedulePublish] = useState(null);
  const [categories, setCategories] = useState([]);
  const tagsRef = useRef(null);
  const metaTitleRef = useRef(null);
  const metaDescriptionRef = useRef(null);
  const [commentable, setCommentable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, SetIsDraft] = useState(false);
  const [isSchedule, SetIsSchedule] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const postDetail = {
      author: authUser._id,
      title: titleRef.current?.value,
      excerpt: excerptRef.current?.value,
      content,
      featuredImage: {
        url: imageRef.current?.value,
        credit: imageCreditRef.current?.value,
      },
      status,
      visibility,
      publishedAt: publishDate,
      scheduledAt: schedulePublish,
      categories,
      tags: tagsRef.current?.value.split(',').map(tag => tag.trim()).filter(Boolean),
      metaTitle: metaTitleRef.current?.value,
      metaDescription: metaDescriptionRef.current?.value,
      isCommentable: commentable,
    };

    const resetForm = () => {
      if (titleRef.current) titleRef.current.value = '';
      if (excerptRef.current) excerptRef.current.value = '';
      if (imageRef.current) imageRef.current.value = '';
      if (imageCreditRef.current) imageCreditRef.current.value = '';
      if (tagsRef.current) tagsRef.current.value = '';
      if (metaTitleRef.current) metaTitleRef.current.value = '';
      if (metaDescriptionRef.current) metaDescriptionRef.current.value = '';

      setContent('');
      setStatus('draft');
      SetIsDraft(true);
      setVisibility('public');
      setPublishDate(null);
      setSchedulePublish(null);
      setCategories([]);
      setCommentable(true);
    };

    try {
      const res = await fetch('http://localhost:5000/api/host/createPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postDetail),
      });

      const result = await res.json();
      console.log('response:', result);

      if (result.success) {
        if(isDraft){
          toast(' Blog Successfully Saved!');
        }
        else{
          toast.success(' Blog Successfully Posted!');
        }
        resetForm();
      } else if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach((err) => toast.error(`❌ ${err}`));
      } else {
        toast.error(`❌ ${result.message || 'Posting failed!'}`);
      }
    } catch (error) {
      console.error('Error while posting failed:', error);
      toast.error('❌ Something went wrong while posting the blog.');
    } finally {
      setIsSubmitting(false);
    }
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
              {authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <h3>{authUser?.name || 'Guest User'}</h3>
              <p>Author</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="post-form layout-split">
              <section className="post-content">
                <div className="card title-excerpt-card">
                  <div className="input-group">
                    <label>Title</label>
                    <input type="text" placeholder="Post title..." ref={titleRef} />
                  </div>
                  <div className="input-group">
                    <label>Excerpt</label>
                    <textarea rows="3" placeholder="Brief summary..." ref={excerptRef}></textarea>
                  </div>
                </div>

                <div className="card editor-card">
                  <div className="input-group">
                    <label>Content *</label>
                    <div className="editor-wrapper">
                      <JoditEditor
                        ref={editorRef}
                        value={content}
                        onChange={setContent}
                        config={{
                          uploader: {
                            insertImageAsBase64URI: false,
                            url: 'http://localhost:5000/api/host/upload',
                            format: 'json',
                            filesVariableName: 'image',
                            withCredentials: true,
                            headers: {
                              Accept: 'application/json',
                              'Content-Type': 'multipart/form-data',
                            },
                          },
                          allowDragAndDropFileToEditor: true,
                          height: 400,
                          toolbarAdaptive: true,
                          askBeforePasteHTML: false,
                          askBeforePasteFromWord: false,
                          defaultActionOnPaste: 'insert_clear_html',
                          events: {
                            afterPaste: (e) => {
                              const plain = e.clipboardData?.getData('text/plain');
                              if (plain) {
                                editorRef.current?.editor?.selection?.insertHTML?.(plain);
                                e.preventDefault();
                              }
                            },
                          },
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
                    <input type="url" placeholder="https://example.com/image.jpg" ref={imageRef} />
                    <input type="text" placeholder="Image credit/source" ref={imageCreditRef} />
                  </div>

                  <div className="input-group">
                    <label>Visibility</label>
                    <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
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
                        SetIsDraft(selected === 'draft');
                        SetIsSchedule(selected==='schedule')
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="publish">Publish</option>
                      <option value="schedule">Schedule</option>
                    </select>
                  </div>

                  {isSchedule && <div className="input-group">
                    <label>Schedule Publish</label>
                    <input
                      type="datetime-local"
                      value={schedulePublish || ''}
                      onChange={(e) => setSchedulePublish(e.target.value)}
                    />
                  </div>}

                  <div className="input-group">
                    <label>Categories</label>
                    <select
                      multiple
                      value={categories}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                        setCategories(selected);
                      }}
                      className = "categories"
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
                    <input type="text" placeholder="tag1, tag2, tag3" ref={tagsRef} />
                  </div>

                  <div className="input-group">
                    <label>Meta Title</label>
                    <input type="text" placeholder="SEO optimized title" ref={metaTitleRef} />
                  </div>

                  <div className="input-group">
                    <label>Meta Description</label>
                    <textarea rows="3" placeholder="SEO description" ref={metaDescriptionRef}></textarea>
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
                  {isSubmitting ? 'Saving...' : 'Save as Draft'}
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              )}
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default CreatePost;
