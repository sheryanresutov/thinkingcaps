'use strict';
(require('rootpath')());

var collection = require('models/collection');

exports.listTutors = function *() {
  yield this.render('tutors', { tutors: yield collection.find({occupation:'tutor'}) });
}
exports.listStudents = function *() {
  yield this.render('students',{ students:yield collection.find({occupation:'student'})});
}
exports.addTutor = function *() {
  yield this.render('newTutor');
}
exports.addStudent = function *() {
  yield this.render('newStudent');
}
exports.edit = function *(id) {
    var result = yield collection.findById(this.params.id);
    if (!result) {
      this.throw(404, 'invalid id');
    }
    if(result.occupation === 'tutor') {
      yield this.render('editTutor', {tutor: result });
    }
    else {
      yield this.render('editStudent',{student: result});
    }
}

exports.show = function *(id) {
  var result = yield collection.findById(this.params.id);
  if (!result) {
    this.throw(404, 'invalid id');
  }
  if(result.occupation == 'tutor') {
    yield this.render('showTutor', {tutor:result});
  } else {
    yield this.render('showStudent',{student:result});
  }
}

//removing should be done by email addresses which are unique
exports.remove = function *(id) {
  var result = yield collection.findById(this.params.id);
  yield collection.remove({"_id":this.params.id});
  if(result.occupation === 'tutor'){
    collection.update(
      {
        tutors: {
          $elemMatch: {
            name:result.name
          }
        },
        occupation:'student'
      },
      {
        $pull: {
          tutors: {
            name:result.name
          }
        }
      },
      {
        multi:true
      });
    this.redirect('/tutors');
  }
  else{
    collection.update(
      {
        students: {
          $elemMatch: {
            name:result.name
          }
        },
        occupation:'tutor'
      },
      {
        $pull: {
          students:{
            name:result.name
          }
        }
      },
      {
        multi:true
      });
    this.redirect('/students');
}}

exports.createTutor = function *() {
  var tutor = this.request.body;
  var date = new Date();
  var haha = yield collection.find(
    {
      occupation:'student',
      tutors: {
        $elemMatch: {
          name:tutor.name
        }
      }
    });

  yield collection.insert({
    occupation:'tutor', 
    name:tutor.name,
    email:tutor.email,
    phone:tutor.phone,
    subjects:tutor.subjects,
    location:tutor.location,
    hours1:tutor.hours1,
    hours2:tutor.hours2,
    hours3:tutor.hours3,
    hours4:tutor.hours4,
    hours5:tutor.hours5,
    hours6:tutor.hours6,
    hours7:tutor.hours7,
    AD:tutor.AD,
    address:tutor.address,
    interests:tutor.interests,
    learning_diff:tutor.learning_diff,
    bio:tutor.bio,
    failed_matches:tutor.failed_matches,
    notes:tutor.notes,
    created_on : date,
    updated_on : date
  })
  this.redirect('/tutors');
}

exports.updateTutor = function *() {
    var tutor = this.request.body;
  var haha = yield collection.find(
    {
      occupation:'student',
      tutors:{
        $elemMatch:{
          name:tutor.name
        }
      }
    }
  );
    yield collection.updateById(tutor.id, { $set: {
    name:tutor.name,
    email:tutor.email,
    phone:tutor.phone,
    subjects:tutor.subjects,
    location:tutor.location,
    hours1:tutor.hours1,
    hours2:tutor.hours2,
    hours3:tutor.hours3,
    hours4:tutor.hours4,
    hours5:tutor.hours5,
    hours6:tutor.hours6,
    hours7:tutor.hours7,
    AD:tutor.AD,
    address:tutor.address,
    interests:tutor.interests,
    learning_diff:tutor.learning_diff,
    bio:tutor.bio,
    failed_matches:tutor.failed_matches,
    notes:tutor.notes,
    updated_on : new Date()
 }})
    this.redirect('/tutor/'+tutor.id);
}

exports.createStudent = function *() {
  var student = this.request.body;
  var date = new Date();
  yield collection.insert({
    occupation:'student', 
    name:student.name,
    status:student.status,
    parent_name:student.parent_name,
    cell_num:student.cell_num,
    home_num:student.home_num,
    email:student.email,
    address_home:student.address_home,
    location_code:student.location_code,
    address_bill:student.address_bill,
    school:student.school,
    age:student.age,
    accom:student.accom,
    refer:student.refer,
    notes:student.notes,
    created_on : date,
    updated_on : date
  });
  for(var i=1;i<=student.tutor_num;i++){
    var c_tutor='tutor'+i.toString();
    var c_subject='subject'+i.toString();
    var c_ad = 'AD'+i.toString();
    if(student[c_tutor] == ""){
      continue;}
    yield collection.update({email:student.email},{$push:{
      tutors:{name:student[c_tutor],
              subject:student[c_subject],
              ad:student[c_ad]}
     }});
    yield collection.update({name:student[c_tutor]},{$set:{students:[]}});
    var haha = yield collection.find({occupation:'student',tutors:{$elemMatch:{name:student[c_tutor]}}});
    var j=haha.length;
    var student_inc = [];
    haha.forEach(function(doc){student_inc[j]=doc;j--});
    for(j=haha.length;j>0;j--){
    /*
    this will return the subject and the ad, which are currently set to null
    collection.aggregation([{$match:{name:student_inc.name}},
                        {$unwind:'$tutors'},{$match:  {'tutors.name':tutor.name}},
                        {$group:{_id:'$_id',tutors:{$push:'$tutors.subject'}}}
                        ]);*/
    yield collection.update({name:student[c_tutor]},{$push:{
      students:{name:student_inc[j].name,
                subject:'null',
                ad:'null'}
    }});
    }     
  }
  this.redirect('/students');
}

exports.updateStudent = function *() {
  var student = this.request.body;
  yield collection.updateById(student.id,{$set:{
    occupation:'student', 
    name:student.name,
    status:student.status,
    parent_name:student.parent_name,
    cell_num:student.cell_num,
    home_num:student.home_num,
    email:student.email,
    address_home:student.address_home,
    tutors:[],
    location_code:student.location_code,
    address_bill:student.address_bill,
    school:student.school,
    age:student.age,
    accom:student.accom,
    refer:student.refer,
    notes:student.notes,
    updated_on : new Date()
  }});
  for(var i=student.tutor_num-1;i>=0;i--){
    var c_tutor='tutor'+i.toString();
    var c_subject='subject'+i.toString();
    var c_ad = 'AD'+i.toString();
    if(student[c_tutor] == ""){
      continue;
    }      
    yield collection.update({email:student.email},{$push:{
      tutors:{name:student[c_tutor],
              subject:student[c_subject],
              ad:student[c_ad]}
     }});
    yield collection.update({name:student[c_tutor]},{$set:{students:[]}});
    var haha = yield collection.find({occupation:'student',tutors:{$elemMatch:{name:student[c_tutor]}}});
    var j=haha.length;
    var student_inc = [];
    haha.forEach(function(doc){student_inc[j]=doc;j--});
    for(j=haha.length;j>0;j--){
    /*
    this will return the subject and the ad, which are currently set to null
    collection.aggregation([{$match:{name:student_inc.name}},
                        {$unwind:'$tutors'},{$match:  {'tutors.name':tutor.name}},
                        {$group:{_id:'$_id',tutors:{$push:'$tutors.subject'}}}
                        ]);*/
    yield collection.update({students:{$elemMatch:{name:student.name}},
                             name:student[c_tutor]},
                          {$pull:{students:{name:student.name,
                                  subject:'null',
                                  ad:'null'}}},
                          {multi:true}); 
    yield collection.update({name:student[c_tutor]},{$push:{
      students:{name:student_inc[j].name,
                subject:'null',
                ad:'null'}
    }});
    }          
  }
  this.redirect('/students');
}
