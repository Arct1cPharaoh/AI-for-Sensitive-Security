from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import idenifier

app = Flask(__name__)
CORS(app)

@app.route('/classify', methods=['POST'])
@cross_origin()
def classify_text():
    print("HI")
    data = request.json
    text = data['text']

    # TODO: Mightnot need this
    max_length = 512
    truncated_text = text[:max_length]

    print(truncated_text)

    entities = idenifier.identify_sensitive_entities(truncated_text)
    for entity_type, entity_text in entities:
        print(f"{entity_type} - {entity_text}")
    return jsonify(entities)

if __name__ == '__main__':
    app.run(debug=True)