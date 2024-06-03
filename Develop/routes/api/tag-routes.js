const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');



const includeProducts = [
  {
      model: Product,
      as: 'tagged_products',
      attributes: [
          'id',
          'product_name',
          'price',
          'stock',
          'category_id'
      ]
  }
]

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data
    Tag.findAll({
    include: [
      {
        model: Product,
        attributes: [
          'id',
          'product_name',
          'price',
          'stock',
          'category_id'
        ]
      },
      includeProducts
    ]
  })
    .then(dbData => res.json(dbData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  Tag.findOne({
    where: {
        id: req.params.id
    },
    include: [
      { 
        model: ProductTag,
        as: 'tagged_products',
        attributes: [
          'id',
          'product_id',
          'tag_id'
        ]
      },
      includeProducts
    ]
})
    .then(dbData => {
        if (!dbData) {
            res.status(404).json({ message: 'No tag found with this id' });
            return;
        }
        res.json(dbData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create({
    tag_name: req.body.tag_name,
})
  .then(dbData => res.json(dbData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(
    {
        tag_name: req.body.tag_name
    },
    {
        where: {
            id: req.params.id
        }
    })
    .then(dbData => {
        if (!dbData[0]) {
            res.status(404).json({ message: 'No tag found with this id' });
            return;
        }
        res.json(dbData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });

});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
    where: {
        id: req.params.id
    }
})
.then(dbData => {
    if (!dbData) {
        res.status(404).json({ message: 'No tag found with this id' });
        return;
    }
    res.json(dbData);
})
.catch(err => {
    console.log(err);
    res.status(500).json(err);
})
});

module.exports = router;
