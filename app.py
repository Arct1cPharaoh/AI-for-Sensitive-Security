from flask import Flask, request, jsonify
from flask_cors import CORS
import identifier

app = Flask(__name__)
CORS(app, resources={r"/classify": {"origins": "https://mail.google.com"}})

@app.route('/classify', methods=['POST'])
def classify_text():
    app.logger.info("Classification request received")
    if not request.json or 'text' not in request.json:
        app.logger.error("Invalid request: No JSON or 'text' field missing")
        return jsonify({"error": "Bad request"}), 400

    text = request.json['text']
    max_length = 512
    truncated_text = text[:max_length]
    app.logger.info(f"Truncated text: {truncated_text}")

    try:
        entities = identifier.identify_sensitive_entities(truncated_text)
        for entity_type, entity_text in entities:
            app.logger.info(f"{entity_type} - {entity_text}")
        return jsonify(entities)
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)  # Set debug=False for production
