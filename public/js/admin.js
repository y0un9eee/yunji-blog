$(document).ready(async function () {
  // 관리자 권한 확인
  try {
    const data = await API.get('/api/auth/me');
    if (data.user.role !== 'admin') {
      window.location.href = '/';
      return;
    }
  } catch {
    window.location.href = '/login';
    return;
  }

  loadPosts();

  async function loadPosts() {
    $('#post-tbody').html('<tr><td colspan="4" class="loading">불러오는 중...</td></tr>');
    try {
      // 전체 포스트를 가져오기 위해 충분히 큰 limit 사용
      const data = await API.get('/api/posts?page=1&limit=1000');
      renderTable(data.posts);
    } catch {
      $('#post-tbody').html('<tr><td colspan="4">포스트를 불러오지 못했습니다.</td></tr>');
    }
  }

  function renderTable(posts) {
    if (!posts.length) {
      $('#post-tbody').html('<tr><td colspan="4" class="loading">작성된 포스트가 없습니다.</td></tr>');
      return;
    }

    const rows = posts.map(p => `
      <tr>
        <td><a href="/post/${p.id}" target="_blank">${escapeHtml(p.title)}</a></td>
        <td>${p.author}</td>
        <td>${formatDate(p.created_at)}</td>
        <td>
          <div class="actions">
            <a href="/edit/${p.id}" class="btn btn-secondary btn-sm">수정</a>
            <button class="btn btn-danger btn-sm" onclick="deletePost(${p.id}, this)">삭제</button>
          </div>
        </td>
      </tr>
    `).join('');

    $('#post-tbody').html(rows);
  }

  window.deletePost = async function (id, btn) {
    if (!confirm('정말 이 포스트를 삭제하시겠습니까?')) return;
    $(btn).prop('disabled', true).text('삭제 중...');
    try {
      await API.del(`/api/posts/${id}`);
      $(btn).closest('tr').fadeOut(300, function () { $(this).remove(); });
    } catch {
      alert('삭제에 실패했습니다.');
      $(btn).prop('disabled', false).text('삭제');
    }
  };

  function escapeHtml(str) {
    return $('<div>').text(str).html();
  }
});
