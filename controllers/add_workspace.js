const Worksapce = require('../models/add_workspace')
const fs = require('fs');
const path = require('path');
const base64 = require('base64-js');
const User =  require('../models/add_user')
// const base64String = "RDpcQUNNRUNNU1xDMzQ=";
// const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
// console.log(decodedString);
const FileUpload = require("../models/fileupload");
const folder = require("../models/folder");
exports.add_workspace = async (req, res) => {
  try {
    let { workspace_name, selected_users, selected_groups, selected_cabinet, id ,workspace_type,enter_quota} = req.body;
    // const decodedString = Buffer.from(selected_cabinet, 'base64').toString('utf-8');
    const enter_quota1 = (enter_quota)*1024*1024
    const userid = await User.findOne({where:{
      email:selected_users[0]
    }})
    let workspace;
    if (id){
      workspace = await Worksapce.findOne({ where: { id: id } });
      if (!workspace) {
        return res.status(404).json({
          message: 'Workspace Not Found'
        });
      }
      await FileUpload.update(
        { workspace_name: workspace_name },
        { where: { workspace_id: id } }
      );

      // Update workspace name in Folder model
      await folder.update(
        { workspace_name: workspace_name },
        { where: { workspace_id: id } }
      );
      await Worksapce.update({
          workspace_name: workspace_name,
          selected_users: Array.isArray(selected_users) ? selected_users : [selected_users],
          selected_groups: Array.isArray(selected_groups) ? selected_groups : [selected_groups],
          selected_cabinet: selected_cabinet,
          workspace_type:workspace_type,
          quota:enter_quota1,
          user_id:userid.id
        },
        { where: { id: id } }
      );
    } else {
      const existingWorkspace = await Worksapce.findOne({
        where: { workspace_name: workspace_name }
      });

      if (existingWorkspace) {
        return res.status(409).json({
          message: 'Workspace Name Already Exists'
        });
      }
      workspace = await Worksapce.create({
        workspace_name: workspace_name,
        selected_users: Array.isArray(selected_users) ? selected_users : [selected_users],
        selected_groups: Array.isArray(selected_groups) ? selected_groups : [selected_groups],
        selected_cabinet: selected_cabinet,
        workspace_type:workspace_type,
        quota:enter_quota1,
        user_id:userid.id
      });
    }
    return res.status(200).json({
      message: `Workspace ${id ? "Updated":"Created"} Successfully`,
      workspace: workspace
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Error ${id ? "Updated":"Created"} Workspace`
    });
  }
};



// 
exports.deleteworksapce=async(req,res)=>{
  try {
    const { id } = req.body;
    const cabinet = await Worksapce.findOne({ where: { id: id } });
    if (!cabinet) {
      return res.status(404).json({
        message: 'Workspace Not Found'
      });
    }
    await Worksapce.destroy({ where: { id: id } });
    return res.status(200).json({
      message: 'Workspace Deleted Successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error Deleting Workspace'
    });
  }
};

// get workspace with pagi....
exports.get_workspace = (req, res) => {
  const page = parseInt(req.body.pageNumber) || 1; 
  const limit =  parseInt(req.body.pageSize) || 5 
  const offset = (page - 1) * limit;

  Worksapce.findAndCountAll({
    // offset,
    // limit,
    order: [['createdAt', 'DESC']] 
  })
    .then((result) => {
      // const totalPages = Math.ceil(result.count / limit);
      const response = {
        message: "Success",
        data: result.rows,
        default_name:"Incomming file"
        // currentPage: page,
        // count:result.count,
        // totalPages
      };

      res.status(200).json(response);
    })
    .catch(() => {
      res.status(500).send("An error occurred while trying to fetch WORKSPACE from the database.");
    });
};


