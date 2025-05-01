from django.shortcuts import get_object_or_404, render
from django.db.models import F
from rest_framework import status
from rest_framework.views import APIView
from api import models
from social.models import (Like, 
                           MyUser, 
                           MyUserImage, 
                           Post, 
                           LikeItem, 
                           SavedItem, 
                           Comment, 
                           Saved, 
                           PostImage, 
                           Subscription)
from rest_framework.generics import CreateAPIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.decorators import action
from rest_framework.response import Response
from collections import defaultdict

from django.contrib.auth import get_user_model
User = get_user_model()


# Create your views here.
from rest_framework import viewsets

from .serializers import (FavoriteSerializer, MySubscribersSerializer, 
                          MyUserIdSerializer, PostCommentSerializer, 
                          PostSerializer, 
                          CommentSerializer, 
                          RegisterSerializer, 
                          SavedSerializer, 
                          SubscriptionSerializer,
                          UserLikesSerializer,
                          ImageUserSerializer,
                        LoginSerializer, PostImageSerializer, UserSerializer
                          )

from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token


class AllUser(viewsets.ModelViewSet):
    
    permission_classes = [AllowAny]
    
    queryset = MyUser.objects.all()
    serializer_class = MyUserIdSerializer

class LoginApiView(APIView):
    
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email, password = serializer.validated_data.get('email'), serializer.validated_data.get('password')
        user = authenticate(email=email, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            read_serializer = MyUserIdSerializer(user, context={'request': request})

            data = {
                **read_serializer.data,
                'token': token.key,
                'user': read_serializer.data
            }

            return Response(data)

        return Response({'detail': 'Пользователь не найден или не правильный пароль.'}, status=status.HTTP_400_BAD_REQUEST)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            raise PermissionDenied("Authentication credentials were not provided.")
        

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def posts_by_user(self, request, user_id=None):
        posts = self.queryset.filter(user__id=user_id)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    
    @action(detail=False, methods=['get'], url_path='with-comments')
    def posts_with_comments(self, request):
        posts = self.queryset.prefetch_related('comments') 
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    

class GetPostComment(ListAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()
    
    def get(self, request, id, *args, **kwargs):
        post = get_object_or_404(Post, id=id)
        root_comments = Comment.objects.filter(post=post, parent=None)
        serializer = CommentSerializer(root_comments, many=True, context={'request': request})
        return Response(serializer.data)
        
    def get_queryset(self):
        return Comment.objects.filter(post__id=self.kwargs['id']).select_related('post')


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            raise PermissionDenied("Authentication credentials were not provided.")
    

class GetPostComments(APIView):
    
    
    def get(self, request, id):
        post = get_object_or_404(Post, id=id)
        root_comments = Comment.objects.filter(post=post, parent=None)
        serializer = CommentSerializer(root_comments, many=True, context={'request': request})
        return Response(serializer.data)


class UserImage(viewsets.ModelViewSet):
    queryset = MyUserImage.objects.all()
    serializer_class = ImageUserSerializer

class LikePostView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = request.data.get('post')

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        like, _ = Like.objects.get_or_create(user=user)
        like_item, item_created = LikeItem.objects.get_or_create(like=like, post=post)

        if not item_created:
            return Response({"status": "already liked"})

        post.likes += 1
        post.save()

        return Response({"status": "liked"})

    def delete(self, request, post_id, *args, **kwargs):
        user = request.user

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            like = Like.objects.get(user=user)
            like_item = LikeItem.objects.get(like=like, post=post)
        except (Like.DoesNotExist, LikeItem.DoesNotExist):
            return Response({"status": "like not found"}, status=status.HTTP_404_NOT_FOUND)

        like_item.delete()
        post.likes = max(0, post.likes - 1)  
        post.save()

        return Response({"status": "like removed"})


class SavedPostView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = request.data.get('post')

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        saved, _ = Saved.objects.get_or_create(user=user)
        saved_item, item_created = SavedItem.objects.get_or_create(saved=saved, post=post)

        if not item_created:
            return Response({"status": "already saved"})

        post.saved += 1
        post.save()

        return Response({"status": "saved"})

    def delete(self, request, post_id, *args, **kwargs):
        user = request.user

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            saved = Saved.objects.get(user=user)
            saved_item = SavedItem.objects.get(saved=saved, post=post)
        except (Saved.DoesNotExist, SavedItem.DoesNotExist):
            return Response({"status": "saved not found"}, status=status.HTTP_404_NOT_FOUND)

        saved_item.delete()
        post.saved = max(0, post.saved - 1)  
        post.save()

        return Response({"status": "saved removed"})


class PostsByUserView(viewsets.ModelViewSet):
    
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    
    queryset = Like.objects.all()
    serializer_class = FavoriteSerializer
    
    
    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def like_by_user(self, request, user_id=None):
        like_instances = self.queryset.filter(user__id=user_id)
        serializer = self.get_serializer(like_instances, many=True)
        return Response(serializer.data)
    

    
    
    def posts_by_user(self, request, user_id=None):
        posts = self.queryset.filter(user__id=user_id)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)



    

class SubscribersPostView(APIView):
    def post(self, request, *args, **kwargs):
        user = request.data.get('user')
        post_id = request.data.get('post')
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        
        post.likes += 1
        post.save()
        return Response({"status": "liked"})
    


class SavedViewSet(viewsets.ModelViewSet):
    queryset = Saved.objects.all()
    serializer_class = SavedSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def saved_by_user(self, request, user_id=None):
        saved_instances = self.queryset.filter(user__id=user_id)
        serializer = self.get_serializer(saved_instances, many=True)
        return Response(serializer.data)
    def posts_by_user(self, request, user_id=None):
        posts = self.queryset.filter(user__id=user_id)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)


class RegisterView(generics.CreateAPIView):
    queryset = MyUser.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response (
            {"message": "Пользователь создан",  
            "user": user,
            },
            status=status.HTTP_201_CREATED
        )
        
        
class SubscribeView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    
    # def get(self, request, user_id):
    #     user = get_object_or_404(MyUser, id=user_id)
    #     subscriptions = Subscription.objects.filter(author=user).select_related('subscriber')
    #     subscribers = [sub.subscriber for sub in subscriptions]
    #     serializer = MyUserIdSerializer(subscribers, many=True)
    #     return Response(serializer.data)
    

    def post(self, request, user_id):
        try:
            target_user = MyUser.objects.get(id=user_id)
            if request.user == target_user:
                return Response({"error": "You can't subscribe to yourself."}, status=400)

            # Subscription.objects.get_or_create(subscriber=request.user, author=target_user)
            
            subscription, created = Subscription.objects.get_or_create(subscriber=request.user, author=target_user)
            if created:
                print("Subscription created!")
            else:
                print("Subscription already exists!")

            return Response({"success": "Subscribed!"}, status=201)
        except MyUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    def delete(self, request, user_id):
        try:
            target_user = MyUser.objects.get(id=user_id)
            Subscription.objects.filter(subscriber=request.user, author=target_user).delete()
            return Response({"success": "Unsubscribed"}, status=204)
        except MyUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


class MySubscriptionsView(ListAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = UserSerializer  

    def get(self, request, user_id):
        try:
            user = MyUser.objects.get(id=user_id)
            subscriptions_count = user.subscriptions.count()
            return Response({"subscriptions_count": subscriptions_count})
        except MyUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
 

class UserSubscribersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            user = MyUser.objects.get(id=user_id)
            subscribers_count = user.subscribers.count()
            return Response({"subscribers_count": subscribers_count})
        except MyUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
    
    
class IsSubscribedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        is_subscribed = Subscription.objects.filter(subscriber=request.user, author_id=id).exists()
        return Response({"is_subscribed": is_subscribed})


class PostImageViewSet(viewsets.ModelViewSet):
    
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer    
    
        
class MySubscribersView(generics.ListAPIView):
    serializer_class = MySubscribersSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(author=self.request.user).select_related('subscriber')