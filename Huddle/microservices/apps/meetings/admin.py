from django.contrib import admin
from .models import (
    Product, ProductApiKey, User, AuditLog, Meeting,
    MeetingParticipant, RecurrenceRule, MeetingSession,
    ParticipantSession, Recording, Transcript
)

admin.site.register(Product)
admin.site.register(ProductApiKey)
admin.site.register(User)
admin.site.register(AuditLog)
admin.site.register(Meeting)
admin.site.register(MeetingParticipant)
admin.site.register(RecurrenceRule)
admin.site.register(MeetingSession)
admin.site.register(ParticipantSession)
admin.site.register(Recording)
admin.site.register(Transcript)
