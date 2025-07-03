// const SimilarPost = ({ post }) => {
//   return (
//     <a href={`/view/${post.slug}`} className="vp-similar-item-anchor">
//       <div className="vp-similar-item">
//         <div className="vp-similar-img-wrap">
//           <img
//             src={post.featuredImageUrl || "https://via.placeholder.com/80x60?text=No+Image"}
//             alt={post.title}
//             className="vp-similar-img"
//           />
//         </div>
//         <div className="vp-similar-info">
//           <h4 className="vp-similar-title">{post.title}</h4>
//           <p className="vp-similar-date">{new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
//         </div>
//       </div>
//     </a>
//   );
// };

// export default SimilarPost;