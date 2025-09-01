from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ⭐ In-memory store (resets when server restarts)
tours = []


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/tours", methods=["GET"])
def get_tours():
    return jsonify(tours)


@app.route("/api/tours", methods=["POST"])
def add_tour():
    data = request.get_json() if request.is_json else request.form
    new_tour = {
        "tour_id": data["tourId"],
        "name": data["name"],
        "destination": data["destination"],
        "start_date": data["startDate"],
        "end_date": data["endDate"],
        "price": data["price"],
        "tour_guide": data["tourGuide"]
    }
    tours.append(new_tour)
    return jsonify({"message": "Tour added successfully"}), 201


@app.route("/api/tours/<tour_id>", methods=["PUT"])
def update_tour(tour_id):
    data = request.get_json()
    for t in tours:
        if t["tour_id"] == tour_id:
            t.update({
                "name": data["name"],
                "destination": data["destination"],
                "start_date": data["startDate"],
                "end_date": data["endDate"],
                "price": data["price"],
                "tour_guide": data["tourGuide"]
            })
            return jsonify({"message": "Tour updated successfully"})
    return jsonify({"error": "Tour not found"}), 404


@app.route("/api/tours/<tour_id>", methods=["DELETE"])
def delete_tour(tour_id):
    global tours
    tours = [t for t in tours if t["tour_id"] != tour_id]
    return jsonify({"message": "Tour deleted successfully"})


if __name__ == "__main__":
    app.run(debug=True)
