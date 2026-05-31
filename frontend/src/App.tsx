import MarkdownPreview from "./MarkdownPreview"


function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
		<MarkdownPreview markdown={`### 🌐 Connect With Me\n\n<div align=\"center\">\n  <a href=\"https://www.linkedin.com/in/abhinav-mishra-53a504286/\"><img src=\"https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white\" alt=\"LinkedIn Badge\"></a>\n  <a href=\"https://www.instagram.com/abhinav550_/\"><img src=\"https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white\" alt=\"Instagram Badge\"></a>\n</div>`} />
    </div>
  )
}

export default App
