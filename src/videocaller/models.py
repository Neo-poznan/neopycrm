from django.db import connection

class UniqueNumbersGenerationSequence():
    def __init__(self):
        cursor = connection.cursor()
        cursor.execute("CREATE SEQUENCE IF NOT EXISTS hash_generation_sequence START WITH 1 INCREMENT BY 1")
    
    def get_next_value(self):
        cursor = connection.cursor()
        cursor.execute("SELECT nextval('hash_generation_sequence')")
        num = cursor.fetchone()[0]
        return num

