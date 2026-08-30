import unittest
import json
import sys
import os

# Ensure the project root is in the Python path for importing modules correctly
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from app import create_app
from models import db
from models.user import User
from models.progress import Progress
from models.exam_result import ExamResult

class TypingClassTestCase(unittest.TestCase):
    """Test suite testing Flask API endpoints and SQLite database operations."""

    def setUp(self):
        """Set up testing environment before each test run."""
        self.app = create_app()
        
        # Override database to use SQLite in-memory database for fast, clean tests
        self.app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///:memory:"
        self.app.config['TESTING'] = True
        
        self.client = self.app.test_client()
        
        # Create database tables in application context
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Clean up testing environment after each test completes."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_user_creation_and_retrieval(self):
        """Test user registration API endpoints and database insertions."""
        # 1. Test creation of a new user profile
        response = self.client.post('/api/users', 
            data=json.dumps({'name': 'Dharshan', 'age': 8}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['user']['name'], 'Dharshan')
        self.assertEqual(data['user']['age'], 8)
        user_id = data['user']['id']

        # 2. Test fetching user profiles by ID
        get_response = self.client.get(f'/api/users/{user_id}')
        self.assertEqual(get_response.status_code, 200)
        get_data = json.loads(get_response.data)
        self.assertTrue(get_data['success'])
        self.assertEqual(get_data['user']['name'], 'Dharshan')

        # 3. Test duplicate checks (should welcome back existing matching profiles)
        dup_response = self.client.post('/api/users', 
            data=json.dumps({'name': 'Dharshan', 'age': 8}),
            content_type='application/json'
        )
        self.assertEqual(dup_response.status_code, 200)
        dup_data = json.loads(dup_response.data)
        self.assertTrue(dup_data['success'])
        self.assertEqual(dup_data['message'], "Welcome back!")

        # 4. Test validation failure (invalid age)
        bad_response = self.client.post('/api/users', 
            data=json.dumps({'name': 'Baby', 'age': 2}),
            content_type='application/json'
        )
        self.assertEqual(bad_response.status_code, 400)
        bad_data = json.loads(bad_response.data)
        self.assertFalse(bad_data['success'])

    def test_user_progress_upserts(self):
        """Test progress tracking API endpoints and level completion percentages."""
        # 1. Register a test user
        user_resp = self.client.post('/api/users', 
            data=json.dumps({'name': 'Kavya', 'age': 10}),
            content_type='application/json'
        )
        user_id = json.loads(user_resp.data)['user']['id']

        # 2. Save progress for Beginner mode
        progress_resp = self.client.post('/api/progress',
            data=json.dumps({
                'user_id': user_id,
                'level': 'beginner',
                'lesson': 'Home Row (F J)',
                'words_completed': 15,
                'accuracy': 96.5,
                'wpm': 18.0
            }),
            content_type='application/json'
        )
        self.assertEqual(progress_resp.status_code, 200)
        p_data = json.loads(progress_resp.data)
        self.assertTrue(p_data['success'])
        self.assertEqual(p_data['progress']['lesson'], 'Home Row (F J)')

        # 3. Fetch progress list for the user
        get_progress = self.client.get(f'/api/progress/{user_id}')
        self.assertEqual(get_progress.status_code, 200)
        gp_data = json.loads(get_progress.data)
        self.assertEqual(len(gp_data['progress']), 1)
        self.assertEqual(gp_data['progress'][0]['level'], 'beginner')

    def test_exam_submissions_and_leaderboard(self):
        """Test exam scoring validations and global rankings sorting."""
        # 1. Register test users
        u1 = json.loads(self.client.post('/api/users', data=json.dumps({'name': 'Sam', 'age': 11}), content_type='application/json').data)['user']['id']
        u2 = json.loads(self.client.post('/api/users', data=json.dumps({'name': 'John', 'age': 9}), content_type='application/json').data)['user']['id']

        # 2. Submit high-speed exam result for Sam
        exam_resp1 = self.client.post('/api/exam-results',
            data=json.dumps({
                'user_id': u1,
                'exam_type': 'Time Cadet Exam',
                'typed_chars': 150,  # 30 words
                'errors': 2,
                'duration': 60       # 1 minute -> WPM = 30
            }),
            content_type='application/json'
        )
        self.assertEqual(exam_resp1.status_code, 201)
        res1 = json.loads(exam_resp1.data)['result']
        self.assertEqual(res1['wpm'], 30.0)
        self.assertEqual(res1['accuracy'], 98.67) # (148/150)*100

        # 3. Submit lower-speed exam result for John
        exam_resp2 = self.client.post('/api/exam-results',
            data=json.dumps({
                'user_id': u2,
                'exam_type': 'Time Cadet Exam',
                'typed_chars': 100,  # 20 words
                'errors': 5,
                'duration': 60       # 1 minute -> WPM = 20
            }),
            content_type='application/json'
        )
        self.assertEqual(exam_resp2.status_code, 201)

        # 4. Check Leaderboard (Sam should rank #1 with higher WPM)
        leader_resp = self.client.get('/api/leaderboard')
        self.assertEqual(leader_resp.status_code, 200)
        leader_data = json.loads(leader_resp.data)['leaderboard']
        
        self.assertEqual(len(leader_data), 2)
        self.assertEqual(leader_data[0]['name'], 'Sam')
        self.assertEqual(leader_data[0]['wpm'], 30.0)
        self.assertEqual(leader_data[1]['name'], 'John')
        self.assertEqual(leader_data[1]['wpm'], 20.0)

if __name__ == '__main__':
    unittest.main()
