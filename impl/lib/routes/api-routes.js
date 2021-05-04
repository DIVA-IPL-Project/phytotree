const nwkParser = require('../utils/newickParser')
const Router = require('express').Router
const router = Router()

// let root = {
//     name: 'root',
//     children: [
//         {
//             name: "A",
//             children: [
//                 {
//                     name: "A1",
//                     children: [
//                         {name: "A12"},
//                         {name: "A13"},
//                         {name: "A14"},
//                         {name: "A15"},
//                         {name: "A16"}
//                     ]
//                 },
//                 {
//                     name: "A2",
//                     children: [
//                         {name: "A21"},
//                         {
//                             name: "A22",
//                             children: [
//                                 {name: "A221"},
//                                 {name: "A222"},
//                                 {name: "A223"},
//                                 {name: "A224"}
//                             ]
//                         },
//                         {name: "A23"},
//                         {name: "A24"},
//                         {name: "A25"}]
//                 },
//                 {
//                     name: "A3",
//                     children: [
//                         {
//                             name: "A31",
//                             children: [
//                                 {name: "A311"},
//                                 {name: "A312"},
//                                 {name: "A313"},
//                                 {name: "A314"},
//                                 {name: "A315"}
//                             ]
//                         }]
//                 }
//             ]
//         },
//         {
//             name: "B",
//             children: [
//                 {
//                     name: "B1",
//                     children: [
//                         {name: "B12"},
//                         {name: "B13"},
//                         {name: "B14"},
//                         {name: "B15"},
//                         {name: "B16"}
//                     ]
//                 },
//                 {
//                     name: "B2",
//                     children: [
//                         {name: "B21"},
//                         {
//                             name: "B22",
//                             children: [
//                                 {name: "B221"},
//                                 {name: "B222"},
//                                 {name: "B223"},
//                                 {name: "B224"}
//                             ]
//                         },
//                         {name: "B23"},
//                         {name: "B24"},
//                         {name: "B25"}]
//                 },
//                 {
//                     name: "B3",
//                     children: [
//                         {
//                             name: "B31",
//                             children: [
//                                 {name: "B311"},
//                                 {name: "B312"},
//                                 {name: "B313"},
//                                 {name: "B314"},
//                                 {name: "B315"}
//                             ]
//                         }]
//                 }
//             ]
//         },
//         {
//             name: "C",
//             children: [
//                 {
//                     name: "C1",
//                     children: [
//                         {name: "C12"},
//                         {name: "C13"},
//                         {name: "C14"},
//                         {name: "C15"},
//                         {name: "C16"}
//                     ]
//                 },
//                 {
//                     name: "C2",
//                     children: [
//                         {name: "C21"},
//                         {
//                             name: "C22",
//                             children: [
//                                 {name: "C221"},
//                                 {name: "C222"},
//                                 {name: "C223"},
//                                 {name: "C224"}
//                             ]
//                         },
//                         {name: "C23"},
//                         {name: "C24"},
//                         {name: "C25"}]
//                 },
//                 {
//                     name: "C3",
//                     children: [
//                         {
//                             name: "C31",
//                             children: [
//                                 {name: "C311"},
//                                 {name: "C312"},
//                                 {name: "C313"},
//                                 {name: "C314"},
//                                 {name: "C315"}
//                             ]
//                         }]
//                 }
//             ]
//         }
//     ]
// };

let root = {
    name: 'root',
    children: [
        {
            name: "A1",
            length: 1,
            children: [
                {length: 1, name: "A12"},
                {length: 1, name: "A13"},
                {length: 1, name: "A14"},
                {length: 1, name: "A15"},
                {length: 1, name: "A16"}
            ]
        },
        {
            name: "A2",
            length: 1,
            children: [
                {length: 1, name: "A21"},
                {
                    name: "A22",
                    length: 1,
                    children: [
                        {length: 1, name: "A221"},
                        {length: 1, name: "A222"},
                        {length: 1, name: "A223"},
                        {length: 1, name: "A224"}
                    ]
                },
                {length: 1, name: "A23"},
                {length: 1, name: "A24"},
                {length: 1, name: "A25"}]
        }
    ]
};

router.get('/data', (req, res, next) => res.json(root))

router.post('/data', (req, res, next) => {
    let newick = req.body;
    let json = nwkParser(newick.data)
    console.log(json)
    res.json(json)
})

module.exports = router