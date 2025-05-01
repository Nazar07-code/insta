from django import forms
from .models import Comment

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']

    def __init__(self, *args, **kwargs):
        self.parent_comment = kwargs.pop('parent_comment', None)
        super().__init__(*args, **kwargs)

    def save(self, *args, **kwargs):
        instance = super().save(commit=False)
        if self.parent_comment:
            instance.parent = self.parent_comment
        instance.save()
        return instance
