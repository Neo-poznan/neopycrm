import hashlib
import base64

from django.db import models
from django.db import connection

class HashGenerationSequence():
    def __init__(self):
        cursor = connection.cursor()
        cursor.execute("CREATE SEQUENCE IF NOT EXISTS hash_generation_sequence")
    
    def get_hash(self):
        cursor = connection.cursor()
        cursor.execute("SELECT nextval('hash_generation_sequence')")
        num = cursor.fetchone()[0]
        orig_id = str(num).encode('utf-8')  
        hash_object = hashlib.sha256(orig_id)
        hash_digest = hash_object.digest()
        short_url_byte = base64.urlsafe_b64encode(hash_digest)[:13]   
        short_url = short_url_byte.decode('utf-8')
        return short_url

