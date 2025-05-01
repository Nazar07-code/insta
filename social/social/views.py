from django.shortcuts import render
from django.shortcuts import redirect
from .models import *

def post_detail(request, id):
    post = Post.objects.get(id=id)
    comments = post.comments.filter(parent__isnull=True)
    form = Comment()

    if request.method == 'POST':
        form = Comment(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.user = request.user
            comment.save()
            return redirect('post_detail', id=post.id)

    return render(request, 'comment.html', {'post': post, 'comments': comments, 'form': form})

# Create your views here.
