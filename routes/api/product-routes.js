
const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
const { doFindAll, doFindOne, doDelete } = require('./api-utils.js');

// The `/api/products` endpoint

// includeCategory and includeTags are both used by findAll and findOne
const includeCategory = {
    model: Category,
    attributes: [
        'id',
        'category_name',
    ]
};

const includeTags = {
    model: Tag,
    attributes: [
        'id',
        'tag_name',
    ]
};

// get all products
router.get('/', (req, res) => {
    // find all products
    // be sure to include its associated Category and Tag data
    doFindAll(Product, [ includeCategory, includeTags ], res);
});

// get one product
router.get('/:id', (req, res) => {
    // find a single product by its `id`
    // be sure to include its associated Category and Tag data
    doFindOne(Product, [ includeCategory, includeTags ], req.params.id, res);
});

// create new product
router.post('/', (req, res) => { 
    /* req.body should look like this...
      {
        product_name: "Basketball",
        price: 200.00,
        stock: 3,
        tagIds: [1, 2, 3, 4]
      }
    */
    Product.create(req.body)
        .then((product) => {
            // if there's product tags, we need to create pairings to bulk create in the ProductTag model
            if (req.body.tagIds?.length) {
                const productTagIdArr = req.body.tagIds.map((tag_id) => {
                    return {
                        product_id: product.id,
                        tag_id,
                    };
                });
                return ProductTag.bulkCreate(productTagIdArr);
            }
            // if no product tags, just respond
            res.status(200).json(product);
        })
        .then((productTagIds) => res.status(200).json(productTagIds))
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
});

// update product
router.put('/:id', (req, res) => { 
    // update product data
    Product.update(req.body, {
        where: {
            id: req.params.id,
        },
    })
        .then((product) => {
            // find all associated tags from ProductTag
            return ProductTag.findAll({ where: { product_id: req.params.id } });
        })
        .then((productTags) => {
            // get list of current tag_ids
        if(productTags?.length>0){

                const productTagIds = productTags.map(({ tag_id }) => tag_id);
                // create filtered list of new tag_ids
                if(req.body.tagIds?.length>0){
                    const newProductTags = req.body.tagIds
                        .filter((tag_id) => !productTagIds.includes(tag_id))
                        .map((tag_id) => {
                            return {
                                product_id: req.params.id,
                                tag_id,
                            };
                        });
                    // figure out which ones to remove
                    const productTagsToRemove = productTags
                        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
                        .map(({ id }) => id);

                    // run both actions
                    return Promise.all([
                        ProductTag.destroy({ where: { id: productTagsToRemove } }),
                        ProductTag.bulkCreate(newProductTags),
                    ]);
                }
            }

        })
        .then((updatedProductTags) => res.json(updatedProductTags))
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
});

router.delete('/:id', (req, res) => {
    // delete one product by its `id` value
    doDelete(Product, req.params.id, res);
});

module.exports = router;
