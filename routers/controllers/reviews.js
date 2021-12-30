const reviewsModel = require("./../../db/models/reviews");

const createReview = (req, res) => {
  try {
    const { creator, rating, description, reference } = req.body;

    const newReview = new reviewsModel({
      creator,
      rating,
      description,
      reference,
    });

    newReview
      .save()
      .then((result) => {
        res.status(201).json(result);
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getCourseReviews = (req, res) => {
  try {
    reviewsModel
      .find({ reference: req.params.courseId })
      .populate({ path: "creator", select: "name avatar" })
      .then((result) => {
        const ratingStatus = {
          oneStar: 0,
          towStar: 0,
          threeStar: 0,
          foreStar: 0,
          fiveStar: 0,
          rating: 0,
          total: result.length,
        };

        result.forEach((data) => {
          switch (data.rating) {
            case 1:
              ratingStatus.oneStar++;
              ratingStatus.rating += 1;
              break;
            case 2:
              ratingStatus.towStar++;
              ratingStatus.rating += 2;
              break;
            case 3:
              ratingStatus.threeStar++;
              ratingStatus.rating += 3;
              break;
            case 4:
              ratingStatus.foreStar++;
              ratingStatus.rating += 4;
              break;
            case 5:
              ratingStatus.fiveStar++;
              ratingStatus.rating += 5;
              break;

            default:
              break;
          }
        });

        ratingStatus.oneStar =
          (ratingStatus.oneStar * 100) / ratingStatus.total;
        ratingStatus.towStar =
          (ratingStatus.towStar * 100) / ratingStatus.total;
        ratingStatus.threeStar =
          (ratingStatus.threeStar * 100) / ratingStatus.total;
        ratingStatus.foreStar =
          (ratingStatus.foreStar * 100) / ratingStatus.total;
        ratingStatus.fiveStar =
          (ratingStatus.fiveStar * 100) / ratingStatus.total;
        ratingStatus.rating = ratingStatus.rating / ratingStatus.total;

        console.log(ratingStatus);

        res.status(200).json({ result, ratingStatus });
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getUserReview = (req, res) => {
  try {
    const { creator, reference } = req.body;

    reviewsModel
      .find({ creator, reference })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createReview, getUserReview, getCourseReviews };
