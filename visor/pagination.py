from rest_framework.pagination import LimitOffsetPagination


class DataTablesPagination(LimitOffsetPagination):

    default_limit = 5
    limit_query_param = 'length'
    offset_query_param = 'start'