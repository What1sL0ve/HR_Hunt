from rest_framework.views import exception_handler


def core_exception_handler(exc, context):
    response = exception_handler(exc, context)
    handlers = {
        'ValidationError': _handle_generic_error
    }
    exception_class = exc.__class__.__name__

    if exception_class in handlers:
        return handlers[exception_class](exc, context, response)

    if response:
        if response.data.get('detail') == 'Токен испорчен' or response.data.get('detail') == (
                'Пользователь соответствующий данному токену не найден.') or response.data.get('detail') == (
            'Учетные данные не были предоставлены.'
        ):
            response.status_code = 401

    return response


def _handle_generic_error(exc, context, response):
    response.data = {
        'errors': response.data
    }
    return response
