from django.contrib import admin
from social.models import *
from django.utils.safestring import mark_safe


from django.utils.html import format_html
from .models import MyUser, MyUserImage
class PostmageStackedInline(admin.TabularInline):

    model = PostImage
    extra = 1


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title']
    readonly_fields = ['likes', 'saved']
    list_display_links = ('title',)
    inlines = [PostmageStackedInline,]
class MyUserAdmin(admin.ModelAdmin):
    list_display = ( 'email', 'avatar_display')

    def avatar_display(self, obj):
        avatar_url = obj.get_avatar()
        if avatar_url:
            return mark_safe(f'<img src="{avatar_url}" width="50" style="border-radius:50%;" />')
        return "Нет фото"   

    avatar_display.short_description = "Аватар"

admin.site.register(MyUser, MyUserAdmin)
admin.site.register(MyUserImage)


admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Saved)

# Register your models here.
