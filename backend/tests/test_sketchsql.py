"""SketchSQL Backend API Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

SAMPLE_DIAGRAM = {
    "id": "test-diagram",
    "name": "Test",
    "dialect": "mysql",
    "tables": [
        {
            "id": "t1",
            "name": "users",
            "color": "blue",
            "columns": [
                {"id": "c1", "name": "id", "type": "INT", "primaryKey": True, "autoIncrement": True, "nullable": False, "unique": False, "defaultValue": ""},
                {"id": "c2", "name": "email", "type": "VARCHAR(255)", "primaryKey": False, "autoIncrement": False, "nullable": False, "unique": True, "defaultValue": ""}
            ]
        },
        {
            "id": "t2",
            "name": "orders",
            "color": "green",
            "columns": [
                {"id": "c3", "name": "id", "type": "INT", "primaryKey": True, "autoIncrement": True, "nullable": False, "unique": False, "defaultValue": ""},
                {"id": "c4", "name": "user_id", "type": "INT", "primaryKey": False, "autoIncrement": False, "nullable": False, "unique": False, "defaultValue": ""}
            ]
        }
    ],
    "relationships": [
        {"id": "r1", "sourceTableId": "t2", "sourceColumnId": "c4", "targetTableId": "t1", "targetColumnId": "c1", "type": "one-to-many", "onDelete": "CASCADE", "onUpdate": "RESTRICT", "label": ""}
    ]
}

class TestHealth:
    """Health check"""
    def test_health_check(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        print("Health check passed")

class TestGenerateSQL:
    """SQL generation tests"""
    def test_generate_mysql(self):
        r = requests.post(f"{BASE_URL}/api/generate-sql", json={"diagram": SAMPLE_DIAGRAM, "dialect": "mysql"})
        assert r.status_code == 200
        data = r.json()
        assert "sql" in data
        sql = data["sql"]
        assert "CREATE TABLE" in sql
        assert "users" in sql
        assert "orders" in sql
        print("MySQL generation passed")

    def test_generate_postgresql(self):
        r = requests.post(f"{BASE_URL}/api/generate-sql", json={"diagram": SAMPLE_DIAGRAM, "dialect": "postgresql"})
        assert r.status_code == 200
        data = r.json()
        assert "sql" in data
        sql = data["sql"]
        assert "CREATE TABLE" in sql
        assert "PostgreSQL" in sql
        print("PostgreSQL generation passed")

    def test_generate_empty_diagram(self):
        r = requests.post(f"{BASE_URL}/api/generate-sql", json={"diagram": {"id": "x", "name": "empty", "dialect": "mysql", "tables": [], "relationships": []}, "dialect": "mysql"})
        assert r.status_code == 200
        print("Empty diagram generation passed")

class TestImportSQL:
    """SQL import/parse tests"""
    def test_import_simple_sql(self):
        sql = """
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  PRIMARY KEY (id)
);
        """
        r = requests.post(f"{BASE_URL}/api/import-sql", json={"sql": sql, "dialect": "mysql"})
        assert r.status_code == 200
        data = r.json()
        assert "diagram" in data
        assert len(data["diagram"]["tables"]) == 1
        assert data["diagram"]["tables"][0]["name"] == "users"
        print("Import SQL passed")

    def test_import_sql_with_fk(self):
        sql = """
CREATE TABLE categories (id INT PRIMARY KEY, name VARCHAR(100) NOT NULL);
CREATE TABLE products (
  id INT PRIMARY KEY,
  category_id INT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
        """
        r = requests.post(f"{BASE_URL}/api/import-sql", json={"sql": sql, "dialect": "mysql"})
        assert r.status_code == 200
        data = r.json()
        assert len(data["diagram"]["tables"]) == 2
        assert len(data["diagram"]["relationships"]) >= 1
        print("Import SQL with FK passed")


class TestShare:
    """Public share endpoint tests"""
    share_id = None

    def test_create_share(self):
        r = requests.post(f"{BASE_URL}/api/share", json={"diagram": SAMPLE_DIAGRAM})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "shareId" in data
        sid = data["shareId"]
        assert isinstance(sid, str)
        assert 6 <= len(sid) <= 12
        # No underscore/dash per _gen_share_id replacement
        assert "_" not in sid and "-" not in sid
        TestShare.share_id = sid
        print(f"Create share passed: {sid}")

    def test_get_share_and_views_increment(self):
        assert TestShare.share_id, "share id not set"
        r1 = requests.get(f"{BASE_URL}/api/share/{TestShare.share_id}")
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["shareId"] == TestShare.share_id
        assert "diagram" in d1 and d1["diagram"]["tables"]
        assert d1["diagram"]["tables"][0]["name"] == "users"
        assert "views" in d1
        v1 = d1["views"]
        r2 = requests.get(f"{BASE_URL}/api/share/{TestShare.share_id}")
        assert r2.status_code == 200
        v2 = r2.json()["views"]
        assert v2 == v1 + 1, f"expected view counter to increment: {v1} -> {v2}"
        print(f"View counter increments: {v1} -> {v2}")

    def test_get_share_not_found(self):
        r = requests.get(f"{BASE_URL}/api/share/nonexistent_xyz_404")
        assert r.status_code == 404
        print("Invalid share id returns 404")

    def test_share_no_mongo_id_leakage(self):
        assert TestShare.share_id
        r = requests.get(f"{BASE_URL}/api/share/{TestShare.share_id}")
        assert r.status_code == 200
        # Mongo _id should be excluded from top-level response keys
        assert "_id" not in r.json()
        print("No mongo _id leakage at top level")
