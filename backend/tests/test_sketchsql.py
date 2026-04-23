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
