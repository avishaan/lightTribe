LightTribe
========

Connect, Mongoose, Node, Swagger

the following is a general backend written in node to add, remove, and edit models.
Technology/Players
----------------------
- Express as the web application framework.
- Connect as the web application framework.
- Node.js as the server platform.
- Swagger for the REST interface specs.
- Jasmine as the testing framework.
- Mongoose as the object modeler for Node.js.
- MongoDB as the x-platform document based noSQL database.
- Istanbul as the code coverage assessment tool
- Socket.io as the real-time bidirectional event-based communication engine

Documentation
----------------------
Each route takes the format of domain/version/route
The route is located in the route documentation.
The version differences are specified in each route.

- Code Coverage(via Istanbul)
  - [Code Coverage Reports](./coverage/lcov-report/index.html)

- Route Documentation
- visit http://lighttribe-dev.herokuapp.com/docs to see the documentation
- [Connecting Routes to Interface (Right Click and Save-As)](./docs/integrations/integration.pdf)
- [Design Composition (Right Click and Save-As)](./docs/design/skinnedWireframe.psd)
- [Socket implementation](./docs/api/sockets.md)

Test Cases
----------------------
Test cases are bundled into logical groups

TODO
----------------------
- [ ] todo list template

Context
----------------------
- keep exploring why caching the auth headers occur when looking for a token, currently sending 401 and body
- consider switching from auth headers to auth in the body
- when image id doesn't actually exist still return something for the url for the images
- add fake data mockup to other controllers
- try to embed object/property value in swagger without complex references
- convert to promises when possible
- swagger-ui using github as the host
- route for getting back list of interests, specifically doing the spec and then the swagger and then dummy controller
- pass array into query parameter https://github.com/swagger-api/swagger-js/blob/master/test/spec/v2/petstore.json#L176-L189
- make sure image url is returned for each post
