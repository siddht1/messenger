from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse


class Conversation(models.Model):
    name = models.CharField(max_length=50)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                     related_name='conversations')

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('chat:conversation', args=[self.pk])


class Message(models.Model):
    text = models.TextField()
    conversation = models.ForeignKey(Conversation, related_name='messages')
    author = models.ForeignKey(settings.AUTH_USER_MODEL)

    def __str__(self):
        return self.text
