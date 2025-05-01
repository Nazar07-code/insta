from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api import views
from .yasg import urlpatterns as url_doc
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register('posts', views.PostViewSet)
router.register('comments', views.CommentViewSet)
router.register('saved', views.SavedViewSet)
router.register('image-user', views.UserImage)
router.register('users', views.AllUser)
router.register('post-images', views.PostImageViewSet)
router.register('like', views.PostsByUserView, basename='user-likes')
# router.register('subscribers', views.SubscribersView)

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginApiView.as_view(), name='login'),
    path('likes/<int:post_id>/', views.LikePostView.as_view(), name='like_post'),
    path('likes/', views.LikePostView.as_view(), name='like_post'),
    path('comments-post/<int:id>/', views.GetPostComment.as_view(), name='comment_post'),
    path('save-post/<int:post_id>/', views.SavedPostView.as_view(), name='saved_post'),
    path('save-post/', views.SavedPostView.as_view(), name='saved_post'),
    path('get-comment/<int:id>/', views.GetPostComments.as_view(), name='comment-create'),
    path('subscribe/<int:user_id>/', views.SubscribeView.as_view()),
    path('subscriptions/<int:user_id>/', views.MySubscriptionsView.as_view()),
    path('subscribers/<int:user_id>/', views.UserSubscribersView.as_view()),

    # path('subscribers/', MySubscribersView.as_view()),  
    path('is-subscribe/<int:id>/', views.IsSubscribedView.as_view(), name='subscriptions'),
    path('', include(router.urls)),  
]

urlpatterns += url_doc
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
