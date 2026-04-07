from flask import Flask, render_template, request, jsonify, session
import random
import re

app = Flask(__name__)
app.secret_key = 'rps_secret_key_2024'

@app.route('/')
def index():
    if 'wins' not in session:
        session['wins'] = 0
        session['losses'] = 0
        session['ties'] = 0
    return render_template('index.html')

@app.route('/play', methods=['POST'])
def play():
    data = request.get_json()
    user_choice = data.get('choice', '').upper()

    if not re.match("^[SRP]$", user_choice):
        return jsonify({'error': 'Invalid choice'}), 400

    choices = ['R', 'P', 'S']
    computer_choice = random.choice(choices)

    labels = {'R': 'Rock', 'P': 'Paper', 'S': 'Scissors'}
    emojis = {'R': '🪨', 'P': '📄', 'S': '✂️'}

    if computer_choice == user_choice:
        result = 'tie'
        message = "It's a tie!"
        session['ties'] = session.get('ties', 0) + 1
    elif (
        (user_choice == 'R' and computer_choice == 'S') or
        (user_choice == 'S' and computer_choice == 'P') or
        (user_choice == 'P' and computer_choice == 'R')
    ):
        result = 'win'
        message = f"{labels[user_choice]} beats {labels[computer_choice]}. You win!"
        session['wins'] = session.get('wins', 0) + 1
    else:
        result = 'loss'
        message = f"{labels[computer_choice]} beats {labels[user_choice]}. I win!"
        session['losses'] = session.get('losses', 0) + 1

    session.modified = True

    return jsonify({
        'user_choice': user_choice,
        'computer_choice': computer_choice,
        'user_label': labels[user_choice],
        'computer_label': labels[computer_choice],
        'user_emoji': emojis[user_choice],
        'computer_emoji': emojis[computer_choice],
        'result': result,
        'message': message,
        'score': {
            'wins': session['wins'],
            'losses': session['losses'],
            'ties': session['ties']
        }
    })

@app.route('/reset', methods=['POST'])
def reset():
    session['wins'] = 0
    session['losses'] = 0
    session['ties'] = 0
    return jsonify({'status': 'reset'})

if __name__ == '__main__':
    app.run(debug=True)
