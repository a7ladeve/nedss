
    // --- السكريبت الأول: وظائف القالب الأساسية (القائمة، المستخدم، لوحة الإعدادات...) ---
    // هذا هو السكريبت الأصلي الخاص بك الذي كان يعمل
    document.addEventListener('DOMContentLoaded', () => {
        const sidebar = document.querySelector('.sidebar');
        const toggleButton = document.getElementById('sidebar-toggle');
        // ... (باقي كود القائمة والبروفايل... سيتم إضافته لاحقاً إذا احتجناه)
        if (toggleButton) { toggleButton.addEventListener('click', () => sidebar.classList.toggle('collapsed')); }

        // تفعيل لوحة الإعدادات
        const body = document.body;
        const root = document.documentElement;
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            // ... (كود لوحة الإعدادات الذي كان يعمل سابقاً)
        }
    });


    // --- السكريبت الثاني: الكود الخاص بالصفحة الرئيسية فقط ---
    async function buildHomepageCategories() {
        const container = document.getElementById('homepage-categories-container');
        if (!container) {
            console.error("Homepage container not found!");
            return;
        }

        try {
            container.innerHTML = "<div style='text-align:center; padding: 50px;'><h3><i class='fas fa-spinner fa-spin'></i> الخطوة 1: جاري جلب التسميات...</h3></div>";
            const labelsResponse = await fetch('/feeds/posts/default?alt=json&max-results=0');
            const labelsData = await labelsResponse.json();
            const labels = labelsData.feed.category.map(cat => cat.term);
            
            if (labels.length === 0) {
                 container.innerHTML = "<div class='category-container' style='padding: 50px; text-align:center;'><h3>لا توجد أقسام (تسميات) لعرضها.</h3></div>";
                 return;
            }

            let finalHtml = '';
            container.innerHTML = "<div style='text-align:center; padding: 50px;'><h3><i class='fas fa-spinner fa-spin'></i> الخطوة 2: جاري جلب المواضيع لكل قسم...</h3></div>";

            for (const label of labels) {
                const postsResponse = await fetch(`/feeds/posts/default/-/${encodeURIComponent(label)}?alt=json&max-results=5`);
                const postsData = await postsResponse.json();
                const posts = postsData.feed.entry || [];
                
                if (posts.length > 0) {
                    let postsHtml = '';
                    posts.forEach(post => {
                        const title = post.title.$t;
                        const url = (post.link.find(link => link.rel === 'alternate') || {}).href;
                        const summary = post.summary ? post.summary.$t.substring(0, 150) + '...' : 'لا يوجد وصف متاح.';
                        const commentsCount = post.thr$total ? post.thr$total.$t : '0';
                        const authorName = post.author[0].name.$t;
                        const timestamp = new Date(post.published.$t).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
                        const firstImage = post.media$thumbnail ? post.media$thumbnail.url.replace('/s72-c/', '/s200-c/') : 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7_4DLPj0l3Y2_dGf3tjp2J-iJw_5_QKQ9w0t82c4D6Fb2F2-2m-31KNDO7uO0mh5-aOq_iJ-2s28XyWwI-hQCRr07hFf2K6-4WfM_k850h1Qaf-9AFMKe5yWjBaeoG3YcsyCjQyS3y/s220/avatar.png';

                        postsHtml += `
                        <div class="forum-card">
                            <div class="forum-status-icon"><img src="${firstImage}" alt="صورة الموضوع"/></div>
                            <div class="forum-info">
                                <h4><a href="${url}">${title}</a></h4>
                                <p>${summary}</p>
                            </div>
                            <div class="forum-meta-data">
                                <div class="forum-stats">
                                    <div class="stat-item"><i class="fa-solid fa-comments"></i><div><span class="stat-number">${commentsCount}</span><span class="stat-label">تعليق</span></div></div>
                                </div>
                                <div class="forum-last-post">
                                    <span class="last-post-author">بواسطة: ${authorName}</span>
                                    <div class="last-post-time">${timestamp}</div>
                                </div>
                            </div>
                        </div>`;
                    });

                    finalHtml += `
                    <div class="category-container">
                        <div class="category-header">
                            <h3><i class="fa-solid fa-star"></i> ${label}</h3>
                        </div>
                        <div class="forum-list">${postsHtml}</div>
                    </div>`;
                }
            }
            container.innerHTML = finalHtml || "<div class='category-container' style='padding: 50px; text-align:center;'><h3>لا توجد مواضيع لعرضها.</h3></div>";

        } catch (error) {
            console.error('فشل جلب بيانات الصفحة الرئيسية:', error);
            container.innerHTML = "<div class='category-container' style='padding: 50px; text-align:center; background-color:#ffdddd; border:1px solid red;'><h3>حدث خطأ أثناء تحميل الصفحة.</h3><p>تفاصيل الخطأ في الـ Console.</p></div>";
        }
    }

    // --- مشغّل الكود ---
    // هذه هي الطريقة الأضمن لتشغيل الكود بعد تحميل الصفحة بالكامل
    if (document.readyState === 'loading') {
        // إذا كانت الصفحة لا تزال قيد التحميل، انتظر الحدث
        document.addEventListener('DOMContentLoaded', function() {
            if (document.body.classList.contains('homepage-view')) {
                buildHomepageCategories();
            }
        });
    } else {
        // إذا تم تحميل الصفحة بالفعل، قم بتشغيل الوظيفة مباشرة
        if (document.body.classList.contains('homepage-view')) {
            buildHomepageCategories();
        }
    }
    
