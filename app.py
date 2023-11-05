from flask import Flask, request, jsonify
import idenifier

app = Flask(__name__)

@app.route('/classify', methods=['POST'])
def classify_text():
    data = request.json
    text = data['text']

    entities = idenifier.identify_sensitive_entities(request.json['text'])
    for entity_type, entity_text in entities:
        print(f"{entity_type} - {entity_text}")
    return jsonify(entities)

if __name__ == '__main__':
    app.run(debug=True)