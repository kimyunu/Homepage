# Importabollio

Importabollio is a web-based file management and posting application that allows users to upload, manage files, and create posts in real-time using Supabase as a backend service.

## Features

### File Management
- **Drag-and-drop file uploads** to Supabase storage
- **External file imports** via URL
- **Image gallery** with previews
- **Local and cloud storage** integration
- **File deletion** functionality

### Post Management
- **Create, read, update, and delete** posts
- **Real-time updates** using Supabase subscriptions
- **Notifications** for post actions
- **Responsive design** for various screen sizes

### Connectivity
- **Online/offline status** indicators
- **Error handling** with helpful messages

## 🛠️ Technical Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: [Supabase](https://supabase.io/) (BaaS - Backend as a Service)
- **Storage**: Supabase Storage
- **Database**: PostgreSQL (via Supabase)
- **Real-time subscriptions**: Supabase Realtime

## Getting Started

### Prerequisites

- A modern web browser
- A Supabase account and project

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/importabollio.git
   cd importabollio
   ```

2. **Configure Supabase**
   - Create a new Supabase project
   - Create a new table called `posts` with the following schema:
     ```sql
     CREATE TABLE posts (
       id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
       title TEXT NOT NULL,
       content TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE
     );
     ```
   - Create a storage bucket named `uploads` and set the appropriate permissions

3. **Update Configuration**
   - In `script-updated.js`, update the Supabase URL and anon key:
     ```javascript
     const SUPABASE_URL = 'your-supabase-url';
     const SUPABASE_KEY = 'your-supabase-anon-key';
     ```

4. **Serve the Application**
   - You can use any simple HTTP server to serve the application locally:
     ```bash
     # Using Python 3
     python -m http.server
     
     # Or using Node.js with http-server
     npx http-server
     ```

5. **Access the Application**
   - Open your browser and navigate to `http://localhost:8000` (or the port shown in your terminal)











## Usage

### File Upload

1. Click the "파일 업로드" (File Upload) button in the navigation
2. Drag and drop files onto the drop zone or click to select files
3. Files will be uploaded to Supabase storage and displayed in the gallery

### External File Upload

1. In the file upload section, enter a URL in the "외부 파일 업로드" (External File Upload) input
2. Click "URL 추가" (Add URL) to import the file
3. The imported file will be processed and added to your gallery

### Post Management

1. Click "새 게시물 작성" (Create New Post) in the navigation
2. Enter a title and content for your post
3. Click "게시물 등록" (Submit Post) to create the post
4. View all posts by clicking "게시물 목록" (Post List)
5. Edit or delete posts using the corresponding buttons

## Security Considerations

- The application uses Supabase's anon key, which should have limited permissions
- Set up proper RLS (Row Level Security) policies in Supabase for production use
- Consider implementing user authentication for more secure access control

## Internationalization

The application is currently in Korean. Key translations:

- 파일 업로드: File Upload
- 새 게시물 작성: Create New Post
- 게시물 목록: Post List
- 게시물 등록: Submit Post
- 수정: Edit
- 삭제: Delete
- 연결됨: Connected
- 연결 끊김: Disconnected










## Responsive Design

The application is designed to work on various screen sizes with a responsive layout.

## Project Structure

```
importabollio/
├── index.html           # Main HTML structure
├── script-updated.js    # Main JavaScript logic
├── style.css            # Additional CSS styles (if any)
├── images/              # Local image directory
│   ├── image1.png
│   ├── image2.png
│   └── ...
└── README.md            # This documentation
```

## Troubleshooting

### Common Issues

- **Files not uploading**: Ensure your Supabase storage permissions are correctly set
- **Posts not showing**: Check if the posts table is correctly created in Supabase
- **Real-time updates not working**: Verify that the Supabase project has realtime enabled
- **"버킷이 존재하지 않습니다" (Bucket does not exist)**: Create the `uploads` bucket in Supabase Storage

### Debug Information

For advanced debugging, check the browser console for detailed error messages.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- [Supabase](https://supabase.io/) for the backend services
- [highlight.js](https://highlightjs.org/) for code highlighting functionality
