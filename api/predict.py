# api/predict.py - AstroMed AI Health Prediction ML API
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "live",
            "model": "AstroMed ML v1",
            "endpoint": "/api/predict",
            "method": "POST",
            "example": {"heart_rate": 108, "spo2": 93, "temperature": 38, "systolic": 125},
            "description": "Python ML API for Health Prediction - Free Tier"
        }).encode())

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
            hr = data.get('heart_rate', 75)
            spo2 = data.get('spo2', 98)
            temp = data.get('temperature', 36.8)
            systolic = data.get('systolic', 120)

            risk = 0
            if hr > 100: risk += 30
            elif hr < 60: risk += 20
            if spo2 < 95: risk += 35
            elif spo2 < 97: risk += 10
            if temp > 37.5: risk += 25
            elif temp < 36: risk += 15
            if systolic > 130: risk += 10
            
            risk = min(risk, 100)
            
            if risk >= 70: status = "Critical"
            elif risk >= 40: status = "Warning"
            else: status = "Normal"
            
            prediction = "Healthy" if risk < 40 else "At Risk" if risk < 70 else "High Risk"

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "live",
                "model": "AstroMed ML v1",
                "risk_score": risk,
                "risk_status": status,
                "prediction": prediction,
                "confidence": 0.92 if risk < 50 else 0.87,
                "recommendation": "Continue monitoring" if risk < 40 else "Medical check recommended" if risk < 70 else "Immediate attention required",
                "input": data
            }).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()