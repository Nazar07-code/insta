from rest_framework.generics import GenericAPIView
import django
from rest_framework import serializers
from rest_framework import status
from rest_framework.decorators import action, permission_classes
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet

# from account.services import User

USE_PAGINATION = 'use_pagination'


def make_bool(val):
    if str(val) == 'false' or str(val) == '0' or str(val) == 'False':
        return False
    else:
        return True


class SerializersByActionMixin:
    serializer_classes = {}

    def get_serializer_class(self):
        if self.action == 'partial_update' or self.action == 'update_partial':
            return self.serializer_classes.get('update', self.serializer_class)
        return self.serializer_classes.get(self.action, self.serializer_class)


class PermissionByActionMixin:
    permission_classes_by_action = {}

    def get_permissions(self):
        _permission_classes = self.permission_classes_by_action.get(self.action, self.permission_classes)
        if self.action == 'partial_update' or self.action == 'update_partial':
            _permission_classes = self.permission_classes_by_action.get('update', self.permission_classes)

        return [permission() for permission in _permission_classes]


class PermissionByMethod:
    permission_classes_by_method = {}

    def get_permissions(self):
        method = self.request.method.lower()
        _permission_classes = self.permission_classes_by_method.get(method, self.permission_classes)
        return [permission() for permission in _permission_classes]


class PaginationBreakerMixin:

    item_to_include = None

    def _break_pagination(self, request):
        use_pagination = make_bool(request.GET.get(USE_PAGINATION, True))
        if not use_pagination:
            self.pagination_class = None

    def list(self, request, *args, **kwargs):
        self._break_pagination(request)
        return super().list(request, *args, **kwargs)


class DestroyModelMixin:
    """
    Destroy a model instance.
    """

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except django.db.models.deletion.ProtectedError as e:
            return Response(status=status.HTTP_423_LOCKED, data={'detail': str(e)})
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()


class MultipleDestroyMixinSerializer(serializers.Serializer):
    ids = serializers.ListSerializer(child=serializers.CharField())


class MultipleDestroyMixin:
    multiple_delete_permission = permission_classes

    @permission_classes([multiple_delete_permission])
    @action(methods=['POST'], url_path='multiple-delete', detail=False)
    def multiple_delete(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        queryset = self.get_queryset()
        items = queryset.filter(pk__in=serializer.data['ids'])
        not_deleted_items = []
        for item in items:
            item_id = item.pk
            try:
                item.delete()
            except django.db.models.deletion.ProtectedError as e:
                not_deleted_items.append(item_id)
        return Response({
            'not_deleted_items': not_deleted_items
        }, status=status.HTTP_204_NO_CONTENT if len(not_deleted_items) == 0 else status.HTTP_423_LOCKED)

    def get_serializer_class(self):
        path = self.request.path.split('/')[-2]
        if path == 'multiple-delete':
            return MultipleDestroyMixinSerializer
        return super().get_serializer_class()


class QuerySetByUserMixin:

    def get_queryset(self):
        qs = super().get_queryset()
        user: User = self.request.user
        if user.is_authenticated:
            if not user.is_superuser:
                return qs.filter(user=user)
        return qs


# class ModifiedResponseMixin:
#
#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
#
#     def update(self, request, *args, **kwargs):
#         partial = kwargs.pop('partial', False)
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=partial)
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)
#
#         if getattr(instance, '_prefetched_objects_cache', None):
#             # If 'prefetch_related' has been applied to a queryset, we need to
#             # forcibly invalidate the prefetch cache on the instance.
#             instance._prefetched_objects_cache = {}
#
#         return Response(serializer.data)


class UltraModelViewSet(
    PermissionByActionMixin,
    MultipleDestroyMixin,
    SerializersByActionMixin,
    PaginationBreakerMixin,
    DestroyModelMixin,
    ModelViewSet,
):
    pass


class UltraReadOnlyModelViewSet(
    PermissionByActionMixin,
    PaginationBreakerMixin,
    SerializersByActionMixin,
    RetrieveModelMixin,
    ListModelMixin,
    GenericViewSet,
):
    pass



# ------------- Generic Api View ----------------


class SerializerByMethodMixin:
    serializer_classes = {}

    def get_serializer_class(self):
        print('called')
        serializer = self.serializer_classes.get(self.request.method)

        print(serializer)

        if serializer is None:
            serializer = super().get_serializer_class()

        return serializer


class ResponseSerializerMixin:
    response_serializer = None

    def get_response_serializer(self, *args, **kwargs):
        assert self.response_serializer is not None, (
                "'%s' should either include a `response_serializer` attribute"
                % self.__class__.__name__
        )

        serializer_class = self.response_serializer
        kwargs.setdefault('context', self.get_serializer_context())
        return serializer_class(*args, **kwargs)


class SuperGenericAPIView(SerializerByMethodMixin, ResponseSerializerMixin, GenericAPIView): ...