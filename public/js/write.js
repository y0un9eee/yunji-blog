$(async () => {
    const pathParts = window.location.pathname.split('/');
    const isEdit = pathParts[1] === 'edit';
    const postId = isEdit ? pathParts[2] : null;

    if (isEdit) {
        $('#page-title').text('글 수정');
        $('#submit-btn').text('수정 완료');

        try {
            const post = await $.get(`/api/posts/${postId}`);
            $('#title-input').val(post.title);
            $('#content-input').val(post.content);
            updatePreview(post.content);
        } catch {
            showAlert('포스트를 불러올 수 없습니다.', 'error');
        }
    }

    $('#content-input').on('input', function () {
        updatePreview($(this).val());
    });

    $('#cancel-btn').on('click', () => {
        window.location.href = isEdit ? `/post/${postId}` : '/';
    });

    $('#write-form').on('submit', async (e) => {
        e.preventDefault();
        const title = $('#title-input').val().trim();
        const content = $('#content-input').val().trim();

        if (!title || !content) {
            showAlert('제목과 내용을 입력해주세요.', 'error');
            return;
        }

        try {
            if (isEdit) {
                await $.ajax({ url: `/api/posts/${postId}`, method: 'PUT', contentType: 'application/json', data: JSON.stringify({ title, content }) });
                window.location.href = `/post/${postId}`;
            } else {
                const res = await $.ajax({ url: '/api/posts', method: 'POST', contentType: 'application/json', data: JSON.stringify({ title, content }) });
                window.location.href = `/post/${res.id}`;
            }
        } catch (err) {
            showAlert(err.responseJSON?.error || '오류가 발생했습니다.', 'error');
        }
    });

    function updatePreview(text) {
        const html = DOMPurify.sanitize(marked.parse(text || ''));
        $('#preview-content').html(html || '<p style="color: var(--light-text); font-style: italic;">왼쪽에 내용을 입력하면 미리보기가 표시됩니다.</p>');
    }

    function showAlert(msg, type) {
        $('#form-alert').attr('class', `alert alert-${type}`).text(msg).show();
        setTimeout(() => $('#form-alert').hide(), 3000);
    }
});
