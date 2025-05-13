// Supabase 설정
const SUPABASE_URL = 'https://dnslnnbcjjsptmzowljh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc2xubmJjampzcHRtem93bGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTQzMTEsImV4cCI6MjA2MjYzMDMxMX0.FOp6XLOSbk416fRDsIIHY_Tz1tAAMlsVbrc1qEsOBrk';
const BUCKET = 'uploads'; // 수정 가능한 버킷 이름

// 올바른 Supabase 클라이언트 초기화
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 실시간 구독 변수
let postsSubscription = null;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const externalFileList = document.getElementById('externalFileList');

// 로컬 이미지 경로
const LOCAL_IMAGES_PATH = 'images';
// 이미지 확장자 정규식
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

// 📁 파일 드래그 앤 드롭 관련 이벤트
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
  dropZone.addEventListener(event, e => {
    e.preventDefault();
    e.stopPropagation();
    if (event === 'dragenter' || event === 'dragover') dropZone.classList.add('drag-over');
    else dropZone.classList.remove('drag-over');
  });
});

// 📁 파일 선택 클릭
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => handleFiles(e.target.files));
dropZone.addEventListener('drop', e => handleFiles(e.dataTransfer.files));

// 버킷 존재 확인 및 생성 함수
async function ensureBucketExists() {
  try {
    // 버킷 목록 가져오기
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    
    if (listError) throw listError;
    
    // 버킷이 존재하는지 확인
    const bucketExists = buckets.some(b => b.name === BUCKET);
    
    if (!bucketExists) {
      // 버킷이 없으면 생성
      const { error: createError } = await client.storage.createBucket(BUCKET, {
        public: true // 파일을 공개적으로 접근 가능하게 설정
      });
      
      if (createError) {
        throw createError;
      }
      console.log(`버킷 '${BUCKET}' 생성 완료`);
    }
    
    return true;
  } catch (error) {
    console.error('버킷 확인/생성 오류:', error);
    document.getElementById("status").innerHTML = `
      <span class="error">❌ 스토리지 버킷 오류: ${error.message}</span>
      <p>자세한 내용: Supabase 콘솔에서 스토리지 버킷을 확인하세요.</p>
    `;
    return false;
  }
}

async function handleFiles(files) {
  const fileArray = Array.from(files);
  
  // 버킷 존재 확인
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    alert('스토리지 버킷을 사용할 수 없습니다. 로컬 저장을 사용합니다.');
    // 여기에 로컬 저장 로직을 추가할 수 있습니다
    return;
  }
  
  for (const file of fileArray) await uploadFile(file);
  loadGallery();
}

async function uploadFile(file) {
  const statusEl = document.getElementById("status");
  statusEl.innerHTML = `<span>업로드 중: ${file.name}...</span>`;
  const filePath = `public/${Date.now()}_${file.name}`;

  try {
    // 버킷 존재 확인
    await ensureBucketExists();
    
    const { data, error } = await client.storage.from(BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true // 같은 이름의 파일이 있으면 덮어쓰기
    });
    
    if (error) throw error;
    statusEl.innerHTML = `<span class="success">✅ 업로드 성공: ${file.name}</span>`;
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    statusEl.innerHTML = `<span class="error">❌ 업로드 실패: ${error.message}</span>`;
    
    // 추가 진단 정보
    if (error.message && error.message.includes('bucket not found')) {
      statusEl.innerHTML += `<p>버킷 '${BUCKET}'이 존재하지 않습니다. Supabase 콘솔에서 확인하세요.</p>`;
    }
  }
}

async function addExternalFile() {
  const url = document.getElementById('externalFileUrl').value.trim();
  if (!url) return alert('URL을 입력해주세요.');

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const fileName = url.split('/').pop() || 'external_file';
    const file = new File([blob], fileName, { type: blob.type });
    await uploadFile(file);
    document.getElementById('externalFileUrl').value = '';
    loadGallery();
  } catch (error) {
    console.error(error);
    alert('파일을 불러오는 데 실패했습니다.');
  }
}

// 로컬 이미지 목록 로드 함수 - 실제 images 디렉토리의 파일들을 표시
function loadLocalImages() {
  // 웹 환경에서는 보안상 로컬 파일 시스템에 직접 접근할 수 없으므로
  // 이미지 폴더에 있는 이미지 목록을 하드코딩하거나 서버에서 받아와야 함
  const localImages = [
    'image1.png',
    'image2.png',
    'image3.png',
    'image4.png',
    'image5.png'
  ];
  
  // Image 3에서 볼 수 있는 파일 이름들로 업데이트
  return localImages;
}

async function loadGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "로딩 중...";
  
  try {
    let hasImages = false;
    gallery.innerHTML = '';
    
    // 1. 로컬 images 폴더의 이미지 로드
    const localImages = loadLocalImages();
    
    // 로컬 이미지 표시
    if (localImages && localImages.length > 0) {
      hasImages = true;
      const localImagesSection = document.createElement('div');
      localImagesSection.className = 'local-images-section';
      localImagesSection.innerHTML = '<h3>로컬 이미지</h3>';
      gallery.appendChild(localImagesSection);
      
      for (const imageName of localImages) {
        const imagePath = `${LOCAL_IMAGES_PATH}/${imageName}`;
        
        const box = document.createElement('div');
        box.className = 'img-box';
        box.innerHTML = `
          <img src="${imagePath}" alt="${imageName}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'150\\' height=\\'150\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23cccccc\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23666666\\'>이미지 없음</text></svg>';">
          <span>${imageName} (로컬)</span>
        `;
        localImagesSection.appendChild(box);
      }
    }
    
    // 2. Supabase에서 이미지 로드 시도
    try {
      // 버킷 접근 가능성 확인
      const bucketExists = await ensureBucketExists();
      
      if (bucketExists) {
        const { data: supabaseData, error } = await client.storage.from(BUCKET).list('public');
        
        if (error) {
          throw error;
        }
        
        if (supabaseData && supabaseData.length > 0) {
          hasImages = true;
          
          // Supabase 이미지를 위한 섹션
          const supabaseSection = document.createElement('div');
          supabaseSection.className = 'supabase-images-section';
          supabaseSection.innerHTML = '<h3>Supabase 이미지</h3>';
          gallery.appendChild(supabaseSection);
          
          for (const item of supabaseData) {
            if (!item.name.match(IMAGE_EXTENSIONS)) continue;
            
            try {
              const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(`public/${item.name}`);
              
              const box = document.createElement('div');
              box.className = 'img-box';
              box.innerHTML = `
                <img src="${urlData.publicUrl}" alt="${item.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'150\\' height=\\'150\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23cccccc\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23666666\\'>이미지 없음</text></svg>';">
                <span>${item.name}</span>
                <button class="btn" onclick="deleteFile('${item.name}')">삭제</button>
              `;
              supabaseSection.appendChild(box);
            } catch (itemError) {
              console.error('이미지 URL 생성 오류:', itemError);
              continue;
            }
          }
        }
      }
    } catch (supabaseError) {
      console.error('Supabase 이미지 로드 오류:', supabaseError);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error';
      errorDiv.textContent = `Supabase 이미지 로드 오류: ${supabaseError.message}`;
      gallery.appendChild(errorDiv);
    }
    
    if (!hasImages) {
      gallery.innerHTML = "아직 업로드된 이미지가 없습니다.";
    }
    
  } catch (error) {
    console.error('갤러리 로드 오류:', error);
    gallery.innerHTML = `<span class="error">❌ 이미지 불러오기 실패: ${error.message}</span>`;
  }
}

async function deleteFile(fileName) {
  if (!confirm('정말로 삭제할까요?')) return;
  try {
    const { error } = await client.storage.from(BUCKET).remove([`public/${fileName}`]);
    if (error) throw error;
    loadGallery();
  } catch (error) {
    console.error(error);
    alert('삭제 실패: ' + error.message);
  }
}

// 📝 게시글 기능
async function createPost() {
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  if (!title || !content) return alert('제목과 내용을 모두 입력해주세요.');

  try {
    const { error } = await client.from('posts').insert([{ title, content, created_at: new Date().toISOString() }]);
    if (error) throw error;
    showNotification('게시물이 등록되었습니다.');
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    // 게시물 등록 후 자동으로 목록으로 이동
    loadPosts();
  } catch (error) {
    console.error(error);
    alert('등록 실패: ' + error.message);
  }
}

// 실시간으로 게시물 표시하는 함수
function addPostToDOM(post, prepend = true) {
  const postList = document.getElementById('postList');
  const div = document.createElement('div');
  div.className = 'post-item';
  div.id = `post-${post.id}`;
  div.innerHTML = `
    <div class="post-header">
      <h3>${post.title}</h3>
      <div class="post-actions">
        <button class="btn" onclick='prepareEditPost(${JSON.stringify(post)})'>수정</button>
        <button class="btn" onclick='deletePost(${post.id})'>삭제</button>
      </div>
    </div>
    <p>${post.content}</p>
    <div class="post-meta">${new Date(post.created_at).toLocaleString()}</div>
  `;
  
  if (prepend && postList.firstChild) {
    postList.insertBefore(div, postList.firstChild);
  } else {
    postList.appendChild(div);
  }
  
  // 새 게시물 하이라이트 효과
  if (prepend) {
    div.style.backgroundColor = '#3a3a3a';
    setTimeout(() => {
      div.style.transition = 'background-color 1s ease';
      div.style.backgroundColor = '';
    }, 100);
  }
}

// 실시간 구독 설정
function setupRealtime() {
  // 기존 구독 취소
  if (postsSubscription) postsSubscription.unsubscribe();
  
  // 새 구독 설정
  postsSubscription = client
    .channel('public:posts')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'posts' }, 
      payload => {
        console.log('새 게시물:', payload);
        addPostToDOM(payload.new, true);
        showNotification('새 게시물이 등록되었습니다.');
      }
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'posts' },
      payload => {
        console.log('게시물 업데이트:', payload);
        updatePostInDOM(payload.new);
        showNotification('게시물이 업데이트되었습니다.');
      }
    )
    .on('postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'posts' },
      payload => {
        console.log('게시물 삭제:', payload);
        removePostFromDOM(payload.old.id);
        showNotification('게시물이 삭제되었습니다.');
      }
    )
    .subscribe();
}

// DOM에서 게시물 업데이트
function updatePostInDOM(post) {
  const postEl = document.getElementById(`post-${post.id}`);
  if (!postEl) return;
  
  postEl.querySelector('h3').textContent = post.title;
  postEl.querySelector('p').textContent = post.content;
  
  // 업데이트 하이라이트 효과
  postEl.style.backgroundColor = '#3a3a3a';
  setTimeout(() => {
    postEl.style.transition = 'background-color 1s ease';
    postEl.style.backgroundColor = '';
  }, 100);
}

// DOM에서 게시물 제거
function removePostFromDOM(postId) {
  const postEl = document.getElementById(`post-${postId}`);
  if (!postEl) return;
  
  // 삭제 효과
  postEl.style.transition = 'opacity 0.5s ease';
  postEl.style.opacity = '0';
  
  setTimeout(() => {
    postEl.remove();
  }, 500);
}

// 알림 표시 함수
function showNotification(message) {
  // 이미 있는 알림 제거
  const existingNotification = document.getElementById('notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 새 알림 생성
  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    z-index: 1000;
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 0.3s, transform 0.3s;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // 표시 애니메이션
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // 3초 후 제거
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

async function loadPosts() {
  const postList = document.getElementById('postList');
  document.getElementById('postForm').style.display = 'none';
  document.getElementById('editPostForm').style.display = 'none';
  document.getElementById('fileUploadSection').style.display = 'none';
  postList.style.display = 'block';
  postList.innerHTML = '로딩 중...';
  
  try {
    const { data, error } = await client.from('posts').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    if (!data || !data.length) {
      postList.innerHTML = '아직 게시물이 없습니다.';
      return;
    }

    postList.innerHTML = '';
    data.forEach(post => {
      addPostToDOM(post, false);
    });
    
    // 실시간 구독 설정
    setupRealtime();
  } catch (error) {
    console.error(error);
    postList.innerHTML = `불러오기 실패: ${error.message}`;
  }
}

function prepareEditPost(post) {
  document.getElementById('editPostId').value = post.id;
  document.getElementById('editPostTitle').value = post.title;
  document.getElementById('editPostContent').value = post.content;
  document.getElementById('editPostForm').style.display = 'block';
  document.getElementById('postForm').style.display = 'none';
  document.getElementById('fileUploadSection').style.display = 'none';
  document.getElementById('postList').style.display = 'none';
}

async function updatePost() {
  const id = document.getElementById('editPostId').value;
  const title = document.getElementById('editPostTitle').value.trim();
  const content = document.getElementById('editPostContent').value.trim();
  if (!title || !content) return alert('제목과 내용을 모두 입력해주세요.');

  try {
    const { error } = await client.from('posts').update({ title, content, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    showNotification('수정 완료!');
    document.getElementById('editPostForm').style.display = 'none';
    loadPosts();
  } catch (error) {
    console.error(error);
    alert('수정 실패: ' + error.message);
  }
}

async function deletePost(postId) {
  if (!confirm('정말로 삭제할까요?')) return;
  try {
    const { error } = await client.from('posts').delete().eq('id', postId);
    if (error) throw error;
    showNotification('삭제 완료');
  } catch (error) {
    console.error(error);
    alert('삭제 실패: ' + error.message);
  }
}

// 🔄 UI 전환
function showPostForm() {
  document.getElementById('postForm').style.display = 'block';
  document.getElementById('editPostForm').style.display = 'none';
  document.getElementById('fileUploadSection').style.display = 'none';
  document.getElementById('postList').style.display = 'none';
}

function showFileUploadSection() {
  document.getElementById('fileUploadSection').style.display = 'block';
  document.getElementById('postForm').style.display = 'none';
  document.getElementById('editPostForm').style.display = 'none';
  document.getElementById('postList').style.display = 'none';
  loadGallery();
}

// 연결 상태 표시 기능
function updateConnectionStatus() {
  const statusElement = document.getElementById('connectionStatus');
  const indicatorElement = document.querySelector('.online-indicator');
  
  if (navigator.onLine) {
    statusElement.textContent = '연결됨';
    indicatorElement.style.backgroundColor = 'var(--success-color)';
  } else {
    statusElement.textContent = '연결 끊김';
    indicatorElement.style.backgroundColor = 'var(--error-color)';
  }
}

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    /* 추가 스타일 */
    .post-item {
      transition: background-color 0.5s ease;
    }
    
    #notification {
      cursor: pointer;
    }
    
    .local-images-section,
    .supabase-images-section {
      margin-top: 20px;
      border-top: 1px solid var(--border-color);
      padding-top: 10px;
    }
    
    .debug-info {
      margin-top: 20px;
      padding: 10px;
      background: #333;
      border: 1px solid #444;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
    }
  `;
  document.head.appendChild(style);
  
  // 연결 상태 모니터링
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  updateConnectionStatus();
  
  // 초기화
  try {
    loadPosts();
  } catch (error) {
    console.error('초기 게시물 로드 실패:', error);
  }
});