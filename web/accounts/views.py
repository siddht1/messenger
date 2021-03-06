from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import Http404
from django.shortcuts import redirect


def login(request, code):
    user = authenticate(code=code)
    if user is None:
        raise Http404('Invalid code.')
    user = auth_login(request, user)
    return redirect('/')


def logout(request):
    auth_logout(request)
    redirect_to = request.GET.get('next', '/')
    return redirect(redirect_to)
