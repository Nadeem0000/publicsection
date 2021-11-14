import * as React from 'react';
import styles from './PublicSection.module.scss';
import { IPublicSectionProps } from './IPublicSectionProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { Web } from "@pnp/sp/webs";
import { ServiceProvider } from './service/ServiceProvider';
import * as $ from "jquery";
import * as moment from "moment";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";

SPComponentLoader.loadCss(`https://fonts.googleapis.com/css?family=Roboto:300,400,500,700`);           
SPComponentLoader.loadCss(`https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css`);   
SPComponentLoader.loadCss(`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css`); 
SPComponentLoader.loadCss(`https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/css/style.css?v=2.2`);
SPComponentLoader.loadCss(`https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/css/responsive.css?v=2.2`);


export interface IPublicSectionState {  
  Recentfile:any[];
  MasterSearchResult:any[];
  items:any[];
  DivisionArr:any[];
  Section:any[];
  DocType:any;
  ResultCount:number;

  CurrentUserName:string;
  CurrentUserDesignation:string;
  CurrentUserProfilePic:string;
}  

let SerachResult=[];
let MasterArray=[];
let DivisionArr=[];
let Section=[];
let DocType=[];
let Flag = "";
let Flag2 = "";
let Flag3 = "";

let DivisArr=[];
let SectionArr=[];
let DocTypeArr=[];

let DivisArrbool= false;
let SectionArrbool= false;
let DocTypeArrbool= false;

let AfterSearchArray = [];

let rowsPerPage;
let rows;
let rowsCount;
let pageCount; // avoid decimals
let numbers;
let MasterGlobalArray=[];
let MasterGlobaFilterArray=[];

var recentresponse = recentresponse || [];
var recentsurl = `/me/drive/recent`; //?$orderby=lastModifiedDateTime desc
let receArray = [];

const NewWeb = Web("https://taqeef.sharepoint.com/sites/Intranet/"); 

export default class PublicSection extends React.Component<IPublicSectionProps, IPublicSectionState, {}> {
  private serviceProvider;
  public constructor(props: IPublicSectionProps, state: IPublicSectionState) {
    super(props);
    this.serviceProvider = new ServiceProvider(this.props.context);   
    this.state = {
    Recentfile: [],
    MasterSearchResult:[], 
    items:[],
    DivisionArr:[],
    Section:[],
    DocType:[],
    ResultCount:0,
    CurrentUserName:"",
    CurrentUserDesignation:"",
    CurrentUserProfilePic:"",
    };
  }

  public componentDidMount(){
    this.LoadDocumentFiles();
    this.GetRecentfile();
    this.getPublictSectionOptions();
    this.GetCurrentUserDetails();    
    $("#numbers li a").on("click",function(){
      $(this).siblings().removeClass("active");
      $(this).addClass("active");
    });
    $(".input-field").focus();

    $('#spLeftNav,#spSiteHeader,#sp-appBar,#spCommandBar,#SuiteNavWrapper').attr('style', 'display: none !important');
    setTimeout(() => {
      $('#spLeftNav,#spSiteHeader,#sp-appBar,#spCommandBar,#SuiteNavWrapper').attr('style', 'display: none !important');
    }, 1000);
    setTimeout(() => {
      $('#spLeftNav,#spSiteHeader,#sp-appBar,#spCommandBar,#SuiteNavWrapper').attr('style', 'display: none !important');
    }, 2000);
  }

  public LoadDocumentFiles(){
    NewWeb.lists.getByTitle("Policy and procedures").items.select("Id","Division","Title","ReleaseDate","Owner/Title","FileRef","FileLeafRef","Section","DocumentType","FileSystemObjectType").expand("File,Folder,Owner").get()
        .then((items)=>{
          if(items.length!=0){                                        
            this.setState({items:items}); 
            //$("#no-result").hide();
            //$(".records").show();
            setTimeout(() => {
              this.pagination();
            }, 2000);
            setTimeout(() => {
              this.pagination();
            }, 4000);
          }
        });
  }

  public GetCurrentUserDetails(){
    var reacthandler = this;           
    $.ajax({  
      url: `${reacthandler.props.siteurl}/_api/SP.UserProfiles.PeopleManager/GetMyProperties`,  
      type: "GET",  
      headers:{'Accept': 'application/json; odata=verbose;'},  
      success: function(resultData) {                
        var email = resultData.d.Email;                               
        var Name = resultData.d.DisplayName;
        var Designation = resultData.d.Title;            
        reacthandler.setState({
          CurrentUserName: Name,
          CurrentUserDesignation: Designation,
          CurrentUserProfilePic: `${reacthandler.props.siteurl}/_layouts/15/userphoto.aspx?size=l&username=${email}`
        });
      },  
      error : function(jqXHR, textStatus, errorThrown) {  
      }  
    });
  }
  
  public ShowUserDetailBlock(){
    $(".user-profile-details").toggleClass("open");
  }
  
  public CloseUserDetailsBlock(){
    $(".user-profile-details").removeClass("open");
  }

  public GetRecentfile(){
    this.serviceProvider.getMyDriveRecents().then((result: any[]): void => {                
      this.setState({ Recentfile: result });  
      //console.log(result);
    }).catch(error => {
        console.log(error);
    });
    
     
  }

  public ClearSearchInput(){
    $(".input-field").val('');
    $(".close-icon").hide();
    $("#txt-err-msg-search").hide();
  }

  public ShowClear(){
   var querylengthwithspace:any = $(".input-field").val();
   var QueryLength = $.trim(querylengthwithspace).length;
    if(QueryLength > 0){
    $(".close-icon").show();
    }else{
      $(".close-icon").hide();
    }
  }
  
  

  public Search(){
    var Division=$("#exampleOption-division").val();
    var Section=$("#exampleOption-section").val();
    var DocType = $("#exampleOption-doc-type").val();

    if(this.Validation()){

      DivisArrbool= false;
      SectionArrbool= false;
      DocTypeArrbool= false;

      $(".recent-search").show();
      var querylengthwithspace:any = $(".input-field").val();
      var Query = $.trim(querylengthwithspace); 
      if(this.checkValue(''+Query+'', SerachResult) == 'Exist'){

      }else{ 
        SerachResult.push(Query);
        if(SerachResult.length > 3){
          SerachResult.shift();
        }
      }
            
      this.setState({
        MasterSearchResult:SerachResult
      }); 

      if(Division != "" || Section != "" || DocType != ""){
        //alert("Filter-search");
        this.SearchResultsBasedOnFilters();
      }else{
        //alert("search-filter");
        this.SearchResult();
      }
    }        
  }

  public checkValue(value,arr){
    var status = 'Not exist';
   
    for(var i=0; i<arr.length; i++){
      var name = arr[i];
      if(name == value){
        status = 'Exist';
        break;
      }
    }
  
    return status;
  }

  public Searchfromrecent(value){
    var Division=$("#exampleOption-division").val('');
    var Section=$("#exampleOption-section").val('');
    var DocType = $("#exampleOption-doc-type").val('');    
    $(".Filter-clear-master").hide();

    $(".input-field").val(value);
    
    $(".close-icon").show();     
    if(this.Validation()){
      $(".recent-search").show();
      var querylengthwithspace:any = $(".input-field").val();
      var Query = $.trim(querylengthwithspace);          
      if(this.checkValue(''+Query+'', SerachResult) == 'Exist'){

      }else{ 
        SerachResult.push(Query);
        if(SerachResult.length > 3){
          SerachResult.shift();
        }
      }
      this.setState({
        MasterSearchResult:SerachResult
      });    
      this.SearchResult();
    }
  }
  
  public SearchResult(){ 
    MasterGlobalArray = [];
      var query:any=$(".input-field").val(); 
      var input = $.trim(query);       
        this.setState({items:[]});            
        NewWeb.lists.getByTitle("Policy and procedures").items.select("Id","Division","Title","ReleaseDate","Owner/Title","FileRef","FileLeafRef","Section","DocumentType","FileSystemObjectType").expand("File,Folder,Owner")
        .filter(`substringof('${input}',Title) or substringof('${input}',FileLeafRef) or substringof('${input}',Division) or substringof('${input}',Section) or substringof('${input}',DocumentType)`).get()
        .then((items)=>{
          if(items.length!=0){                                        
            this.setState({ResultCount:items.length,items:items}); 
            MasterGlobalArray.push(items);
            $("#no-result").hide();
            $(".records").show();
            setTimeout(() => {
              this.pagination();
            }, 900);
          }else{
            $("#numbers").empty();
            $(".records").hide();            
            $("#no-result").show();
          }
        });      
  }

  public SearchResultsBasedOnFilters(){
    var queryarr = [];  
    var filterquery;    
    var Division=$("#exampleOption-division").val();
    var Section=$("#exampleOption-section").val();
    var DocType = $("#exampleOption-doc-type").val();
    
    if(Division != "" && Division != 'undefined' && Division != null){        
      queryarr.push(`Division eq '${Division}' `);
    }
    if(Section != "" && Section != 'undefined' && Section != null){         
      queryarr.push(`Section eq '${Section}' `);
    }
    if(DocType != "" && DocType != 'undefined' && DocType != null){         
      queryarr.push(`DocumentType eq '${DocType}' `);
    }
    filterquery = queryarr.join("and "); 

    var query:any=$(".input-field").val(); 
    var input = $.trim(query);       
      this.setState({items:[]});            
      NewWeb.lists.getByTitle("Policy and procedures").items.select("Id","Division","Title","ReleaseDate","Owner/Title","FileRef","FileLeafRef","Section","DocumentType","FileSystemObjectType").expand("File,Folder,Owner")
      .filter(`${filterquery} and substringof('${input}',Title) or substringof('${input}',FileLeafRef) or substringof('${input}',Section) or substringof('${input}',Division)`).get()
      .then((items)=>{
        if(items.length!=0){                                        
          this.setState({ResultCount:items.length,items:items}); 
          $("#no-result").hide();
          $(".records").show();
          setTimeout(() => {
            this.pagination();
          }, 900);
        }else{
          $("#numbers").empty();
          $(".records").hide();            
          $("#no-result").show();
        }
      });      
}
  
  //DropDown Options
  public getPublictSectionOptions(){   
    var handler = this;  
    DocType =[];
    DivisionArr=[];
    Section=[]
    $.ajax({
      url: "https://taqeef.sharepoint.com/sites/Intranet/_api/web/lists/GetByTitle('Policy and procedures')/fields?$filter=EntityPropertyName eq 'Section' or EntityPropertyName eq 'Division' or EntityPropertyName eq 'DocumentType'",
      type: "GET",
      headers: {
        "accept": "application/json;odata=verbose",
      },
      success: function (data) {    
        for(var j = 0; j < data.d.results.length; j++){ 
          if(data.d.results[j].InternalName == "Section"){                   
            for(var i = 0; i < data.d.results[j].Choices.results.length; i++){               
              Section.push(data.d.results[j].Choices.results[i]);              
            }                    
          }
          else if(data.d.results[j].InternalName == "Division"){                   
            for(var k = 0; k < data.d.results[j].Choices.results.length; k++){              
              DivisionArr.push(data.d.results[j].Choices.results[k]);
            }                   
          }          
          else if(data.d.results[j].InternalName == "DocumentType"){                   
            for(var n = 0; n < data.d.results[j].Choices.results.length; n++){              
              DocType.push(data.d.results[j].Choices.results[n]);
            }
          }
        }     
        handler.setState({
          Section:Section,
          DivisionArr: DivisionArr,
          DocType: DocType
        });        
      },
      error: function (error) {
        console.log(JSON.stringify(error));
      }
    });    
  }
  
  
  public masterfilter(ActiveDDL){  
    this.setState({ResultCount:0});
    // DivisArr=[];
    // SectionArr=[];
    // DocTypeArr=[];
      var Division=$("#exampleOption-division").val();
      var Section=$("#exampleOption-section").val();
      var DocType = $("#exampleOption-doc-type").val();
    if(Division == "" && Section == "" && DocType == ""){
      $(".Filter-clear-master").hide();
    }
    
    if(Division != "" || Section != "" || DocType != ""){
      $(".Filter-clear-master").show();
    }
      var query:any=$(".input-field").val(); 
      var input = $.trim(query);       
        if(input==""){            
          this.BeforeSearchFilterChange();
          this.setState({items:[]});
        }
        else{         
          this.AfterSearchFilterChnge();
          this.setState({items:[]});
          
        }
  }

  public MasterFilterClear(){
    var Division=$("#exampleOption-division").val('');
    var Section=$("#exampleOption-section").val('');
    var DocType = $("#exampleOption-doc-type").val('');    
    $(".Filter-clear-master").hide();

    DivisArrbool= false;
    SectionArrbool= false;
    DocTypeArrbool= false;
    var Query:any = $(".input-field").val();
    var SearchQuery = $.trim(Query);
    if(SearchQuery != ''){
      this.Search();
    }
  }

  public ClearFilterInput(ClearDDL){
    if(ClearDDL == "Division"){
      var Division=$("#exampleOption-division").val('');
    }else if(ClearDDL == "Section"){
      var Section=$("#exampleOption-section").val('');
    }else if(ClearDDL == "DocType"){
      var DocType = $("#exampleOption-doc-type").val('');
    }
  }


  public Validation(){    
    let formstatus = true;
    var Query:any = $(".input-field").val();
    var SearchQuery = $.trim(Query);
    if(formstatus == true && SearchQuery != ''){
      $("#txt-err-msg-search").hide();
      return formstatus;      
    }else{
      $("#txt-err-msg-search").show();
      formstatus = false;      
    }
    return formstatus;
  }
  
      
  // public AfterSearchFilterChnge(){ 
  //   MasterGlobaFilterArray=[];
  //   var queryarr = []; 
  //   DivisArr=[];
  //   SectionArr=[];
  //   DocTypeArr=[];
  //   var filterquery;
  //   var QueryString = $(".input-field").val(); 
  //   var Division=$("#exampleOption-division").val();
  //   var Section=$("#exampleOption-section").val();
  //   var DocType = $("#exampleOption-doc-type").val();
    
  //   if(Division != "" && Division != 'undefined' && Division != null){        
  //     queryarr.push(`Division eq '${Division}' `);
  //   }
  //   if(Section != "" && Section != 'undefined' && Section != null){         
  //     queryarr.push(`Section eq '${Section}' `);
  //   }
  //   if(DocType != "" && DocType != 'undefined' && DocType != null){         
  //     queryarr.push(`DocumentType eq '${DocType}' `);
  //   }
  //   filterquery = queryarr.join("and ");         
  //   //let data = this.state.items;
  //   let data = MasterGlobalArray;

  //   if(Division != "" && DivisArrbool == false){
  //     DivisArrbool = true;
      
  //     $("#numbers").empty();
      
  //     for(var i = 0; i < data.length; i++){
  //       if(data[i].Division == ""+Division+""){
  //         DivisArr.push(data[i]);      
  //         setTimeout(() => {
  //           this.setState({ResultCount:DivisArr.length,items:DivisArr});   
  //         }, 1000); 
             
  //       }
  //     } 
  //     if(DivisArr.length != 0){
  //       $("#no-result").hide();
  //       $(".records").show();
  //     }else{
  //       Flag = "true";
  //       $("#no-result").show();
  //       $(".records").hide();
  //     }
  //     setTimeout(() => {
  //       this.pagination();
  //     }, 1500);              
  //   }else if(DivisArr.length == 0 ){//&& DivisArrbool == true
  //     $("#no-result").show();
  //     $(".records").hide();
  //     $("#numbers").empty();
  //   }else{
  //     //$("#no-result").hide();
  //     //$(".records").show();
  //   }
  //   if(Section != ""){// && SectionArrbool == false
  //     SectionArrbool = true;
      
  //     $("#numbers").empty();
  //     for(var j = 0; j < data.length; j++){
  //       if(data[j].Section == ""+Section+""){
  //         SectionArr.push(data[j]);
  //         setTimeout(() => {
  //           this.setState({ResultCount:SectionArr.length,items:SectionArr});      
  //         }, 1000); 
          
  //       }
  //     } 
  //     if(SectionArr.length != 0){
     
  //       $("#no-result").hide();
  //       $(".records").show();
  //     }else{
      
  //       Flag2 = "true";
  //       $("#no-result").show();
  //       $(".records").hide();
  //     }
  //     setTimeout(() => {
  //       this.pagination();
  //     }, 1500);          
  //   }
  //   if(SectionArr.length == 0){// && SectionArrbool == true
  //     $("#no-result").show();
  //     $(".records").hide();
  //     $("#numbers").empty();
  //   }else{
  //     //$("#no-result").hide();
  //     //$(".records").show();
  //   }

  //   if(DocType != ""  && DocTypeArrbool == false){
  //     DocTypeArrbool = true;
      
  //     $("#numbers").empty();
  //     for(var k = 0; k < data.length; k++){
  //       if(data[k].DocumentType == ""+DocType+""){
  //         DocTypeArr.push(data[k]);

  //         setTimeout(() => {
  //           this.setState({ResultCount:DocTypeArr.length,items:DocTypeArr});            
  //         }, 1500);    
               
  //       }
  //     }  
  //     if(DocTypeArr.length != 0){
        
  //       $("#no-result").hide();
  //       $(".records").show();
  //     }else{
  //       Flag3 = "true";
  //       $("#no-result").show();
  //       $(".records").hide();
  //     }
  //     setTimeout(() => {
  //       this.pagination();
  //     }, 2000);     
  //   }else if(DocTypeArr.length == 0){// && DocTypeArrbool == true
  //       $("#no-result").show();
  //       $(".records").hide();
  //       $("#numbers").empty();
  //     }else{
  //       //$("#no-result").hide();
  //       //$(".records").show();
  //     } 
  // }
  public AfterSearchFilterChnge(){ 
    $("#numbers").empty();
    MasterGlobaFilterArray=[];
    var queryarr = []; 
    DivisArr=[];
    SectionArr=[];
    DocTypeArr=[];
    var filterquery;
    var QueryString = $(".input-field").val(); 
    var Division=$("#exampleOption-division").val();
    var Section=$("#exampleOption-section").val();
    var DocType = $("#exampleOption-doc-type").val();

    let data = MasterGlobalArray[0];

    if(Division != "" && Section == "" && DocType == ""){ 
      for(var i = 0; i < data.length; i++){
        if(data[i].Division == ""+Division+""){
          DivisArr.push(data[i]);                
          setTimeout(() => {
            this.setState({ResultCount:DivisArr.length,items:DivisArr}); 
          }, 1000);           
        }
      }      
      if(DivisArr.length != 0){
        $("#no-result").hide();
        $(".records").show();
        setTimeout(() => {
          this.pagination();
        }, 1500);
      }else{
        $("#no-result").show();
        $(".records").hide();
        $("#numbers").empty();
      }  
    }
    if(Division == "" && Section != "" && DocType == ""){ 
      for(var i = 0; i < data.length; i++){
        if(data[i].Section == ""+Section+""){
          DivisArr.push(data[i]); 
          setTimeout(() => {
            this.setState({ResultCount:DivisArr.length,items:DivisArr}); 
          }, 1000);                 
                     
        }
      }
      if(DivisArr.length != 0){
        $("#no-result").hide();
        $(".records").show();
        setTimeout(() => {
          this.pagination();
        }, 1500);
      }else{
        $("#no-result").show();
        $(".records").hide();
        $("#numbers").empty();
      }
    }
    if(Division == "" && Section == "" && DocType != ""){ 
      for(var i = 0; i < data.length; i++){
        if(data[i].DocumentType == ""+DocType+""){
          DivisArr.push(data[i]);      
          setTimeout(() => {
            this.setState({ResultCount:DivisArr.length,items:DivisArr});   
          }, 1000);   
                      
        }
      }
      if(DivisArr.length != 0){
        $("#no-result").hide();
        $(".records").show();
        setTimeout(() => {
          this.pagination();
        }, 1500);
      }else{
        $("#no-result").show();
        $(".records").hide();
        $("#numbers").empty();
      }
    }

    if(Division != "" && Section != "" && DocType == ""){ 
      for(var i = 0; i < data.length; i++){
        if(data[i].Section == ""+Section+"" && data[i].Division == ""+Division+""){
          DivisArr.push(data[i]);                  
          setTimeout(() => {
            this.setState({ResultCount:DivisArr.length,items:DivisArr}); 
          }, 1000);             
        }
      }
      if(DivisArr.length != 0){
        $("#no-result").hide();
        $(".records").show();
        setTimeout(() => {
          this.pagination();
        }, 1500);
      }else{
        $("#no-result").show();
        $(".records").hide();
        $("#numbers").empty();
      }
    }
    if(Division == "" && Section != "" && DocType != ""){ 
      for(var i = 0; i < data.length; i++){
        if(data[i].DocumentType == ""+DocType+"" && data[i].Section == ""+Section+""){
          DivisArr.push(data[i]);                   
          setTimeout(() => {
            this.setState({ResultCount:DivisArr.length,items:DivisArr}); 
          }, 1000);         
        }
      }
      if(DivisArr.length != 0){
        $("#no-result").hide();
        $(".records").show();
        setTimeout(() => {
          this.pagination();
        }, 1500);
      }else{
        $("#no-result").show();
        $(".records").hide();
        $("#numbers").empty();
      }
    }
    if(Division != "" && Section == "" && DocType != ""){ 
      for(var i = 0; i < data.length; i++){
        if(data[i].DocumentType == ""+DocType+"" && data[i].Section == ""+Section+""){
          DivisArr.push(data[i]);                      
          setTimeout(() => {
            this.setState({ResultCount:DivisArr.length,items:DivisArr}); 
          }, 1000);         
        }
      }
      if(DivisArr.length != 0){
        $("#no-result").hide();
        $(".records").show();
        setTimeout(() => {
          this.pagination();
        }, 1500);
      }else{
        $("#no-result").show();
        $(".records").hide();
        $("#numbers").empty();
      }
    }

    if(Division != "" && Section != "" && DocType != ""){ 
      for(var i = 0; i < data.length; i++){
        if(data[i].DocumentType == ""+DocType+"" && data[i].Section == ""+Section+"" && data[i].Division == ""+Division+""){
          DivisArr.push(data[i]);                  
          setTimeout(() => {
            this.setState({ResultCount:DivisArr.length,items:DivisArr}); 
          }, 1000);             
        }
      }
      if(DivisArr.length != 0){
        $("#no-result").hide();
        $(".records").show();
        setTimeout(() => {
          this.pagination();
        }, 1500);
      }else{
        $("#no-result").show();
        $(".records").hide();
        $("#numbers").empty();
      }
    }
  }
  
  public BeforeSearchFilterChange(){
    this.setState({items:[]});
    var Globqueryarr = [];
    var filterquery;
      
    var Division=$("#exampleOption-division").val();
    var Section=$("#exampleOption-section").val();
    var DocType = $("#exampleOption-doc-type").val();
  
    if(Division != "" && Division != 'undefined' && Division != null){
      Globqueryarr.push(` Division eq '${Division}' `);
    }
    if(Section != "" && Section != 'undefined' && Section != null){
      Globqueryarr.push(` Section eq '${Section}' `);
    }
    if(DocType != "" && DocType != 'undefined' && DocType != null){         
      Globqueryarr.push(`DocumentType eq '${DocType}' `);
    }
    filterquery = Globqueryarr.join(" and ");      
    
    NewWeb.lists.getByTitle("Policy and procedures").items.select("Id","Title","FileLeafRef","ReleaseDate","Owner/Title","Division","Section","DocumentType","FileSystemObjectType").
    filter(""+filterquery+"").expand("File,Folder,Owner").get()
    .then((items)=>{      
    if(items.length!=0){      
      this.setState({ResultCount:items.length,items:items}); 
      $("#no-result").hide();
      $(".records").show();
      setTimeout(() => {
        this.pagination();
      }, 900);
    }else{
      $("#no-result").show();
      $(".records").hide();
      $("#numbers").empty();
    }
    });
  }

  public pagination(){
    $("#numbers").empty();
    rowsPerPage = 10;
    rows = $('.table tbody tr');
    rowsCount = rows.length;
    pageCount = Math.ceil(rowsCount / rowsPerPage); // avoid decimals
    numbers = $('#numbers');
    
    // Generate the pagination.
    //if(pageCount > 10){
      for (var i = 0; i < pageCount; i++) {   
        if(i == 0)   
        numbers.append('<li className="page-item active"><a className="page-link no-border" href="#">' + (i+1) + '</a></li>')
        else
        numbers.append('<li className="page-item"><a className="page-link no-border" href="#">' + (i+1) + '</a></li>')
      }
    /*}else{
      $("#numbers").empty();
    }*/
      
    // Mark the first page link as active.
    $('#numbers li:first-child a').addClass('active');

    // Display the first set of rows.
    displayRows(1);
    
    // On pagination click.
    $('#numbers li a').on("click",function(e) {
      
      var $this = $(this);
      
      e.preventDefault();
      
      // Remove the active class from the links.
      $('#numbers li a').removeClass('active');
      
      // Add the active class to the current link.
      $this.addClass('active');
      
      // Show the rows corresponding to the clicked page ID.
      
      displayRows($this.text());
    });
  }



  public render(): React.ReactElement<IPublicSectionProps> {
    var reactHandler = this;    
    let count = 0;
    let cntr = 0;
    const Recents: JSX.Element[] = reactHandler.state.Recentfile.map(function (item, key) {  
            
      var FileTypeImg="";
      var filename=item.name;                       
      var Len = filename.length; 
      var Dot = filename.lastIndexOf(".");
      var extension = filename.substring(Dot+1, Len);

      var FileWebURL = ""+item.remoteItem.webDavUrl+"";
      var URLContains = "Policyandprocedures";

        if(extension != "csv" && count < 5 && FileWebURL.indexOf(URLContains) != -1){ 
          count++;
          $("#doc-recent-viewed").show();
          if(extension == 'docx' || extension == 'doc' || extension == 'pdf' || extension == 'xlsx' || extension == 'pptx' || extension == 'url' || extension == 'txt' || extension == 'css' || extension == 'sppkg' || extension == 'ts' || extension == 'tsx' || extension == 'html' || extension == 'aspx' || extension == 'ts' || extension == 'js' || extension == 'map' || extension == 'php' || extension == 'json' || extension == 'xml' ||
            extension == 'png' || extension == 'PNG' || extension == 'JPG' || extension == 'JPEG'  || extension == 'SVG' || extension == 'svg' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || 
            extension == "zip" || extension == "rar"){
            if(extension == 'docx' || extension == 'doc'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/WordFluent.png`;             
            }
            if(extension == 'pdf'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/pdf.svg`;
            }
            if(extension == 'xlsx'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/ExcelFluent.png`;
            }
            if(extension == 'pptx'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/PPTFluent.png`;
            }
            if(extension == 'url'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/URL.png`;
            }
            if(extension == 'txt'){ 
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/txt.svg`;
            }
            if(extension == 'css' || extension == 'sppkg' || extension == 'ts' || extension == 'tsx' || extension == 'html' || extension == 'aspx' || extension == 'ts' || extension == 'js' || extension == 'map' || extension == 'php' || extension == 'json' || extension == 'xml'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/Code.svg`;
            }
            if(extension == 'png' || extension == 'PNG' || extension == 'JPG' || extension == 'JPEG'  || extension == 'SVG' || extension == 'svg' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/photo.svg`;
            }
            if(extension == "zip" || extension == "rar"){
              FileTypeImg=`${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/zip.svg`;
            }
            return(                
              
                <div className="col-md-2 gallery-width">
                  <div className="card-gallery">                    
                    <div className="card-body">
                      <ul className="document-data">
                        <li><a href={`${item.webUrl}`} data-interception="off" target="_blank"><img src={`${FileTypeImg}`} alt="MicrosoftTeams-image" className="document-image"/></a></li>                      
                        <li className="document-name"><a href={`${item.webUrl}`} data-interception="off" target="_blank">{item.name}</a></li>
                      </ul>
                    </div>
                  </div>
                </div>              
            );   
          }
        }               
    });
      
    const SearchResultJSX: JSX.Element[] = reactHandler.state.MasterSearchResult.map(function (item, key) { 
      return (     
        <div className="form-group col-lg-3">
          <div className="form-group has-feedback">
            <input type="button" className="form-control" value={item} onClick={()=>reactHandler.Searchfromrecent(item)}/>
            <span className="search-icon form-control-feedback">
              <img src="https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/images/search%20(6).svg" alt="MicrosoftTeams-image"/>
            </span>              
          </div>
        </div>
      );        
    });

    const DivisionOptions: JSX.Element[] = this.state.DivisionArr.map(function(item,key) {
      return(
        <option value={`${item}`}>{item}</option>
      );
    });

    const SectionOptions: JSX.Element[] = this.state.Section.map(function(item,key) {
      return(
        <option value={`${item}`}>{item}</option>
      );
    });

    const DocTypeOptions: JSX.Element[] = this.state.DocType.map(function(item,key) {
      return(
        <option value={`${item}`}>{item}</option>
      );
    });

    const DocLibResult: JSX.Element[] = reactHandler.state.items.map(function (item, key) { 
      cntr++;
      var folder=item.FileSystemObjectType; 
      var FileOpenPath;
      if(item.DocumentType != null){
        let DocTypeArr = item.DocumentType;        
        for(let i = 0; i < DocTypeArr.length; i++){                   
          setTimeout(() => {                                      
            if ($(`.general-clas-${key}-${i}`)[0]){
              // Do something if class exists
            } else {
              $("#"+item.Id+"-DocumentType").append(`<h6 class="badge badge-primary general-clas-${key}-${i}">${DocTypeArr[i]}</h6>`);  
            }                                    
          }, 100);
        }
        if(folder==1){
              return(      
              <tr>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.Division}</p>            
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.Section}</p>
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-emp-img">
                    <img src="https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/images/Folder.png" alt="Company" />
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-title">
                  <a href={`https://taqeef.sharepoint.com/${item.Folder.ServerRelativeUrl}`} data-interception="off" target="_blank">{item.Folder.Name}</a>
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.ReleaseDate == null ? "" : moment(item.ReleaseDate).format("DD/MMM/YYYY")}</p>
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.Owner && item.Owner[0].Title}</p>
                  </div>
                </td>
                <td>
                  <div id={item.Id+"-DocumentType"}>
                    
                  </div>
                </td>
              </tr>
              );
        }
        else{
              var FileTypeImg="";
              var filename=item.File.Name; 
              var Len = filename.length; 
              var Dot = filename.lastIndexOf(".");
              var extension = filename.substring(Dot+1, Len);              

              if(extension == 'docx' || extension == 'doc'){
                FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/WordFluent.png`;  
                FileOpenPath = `https://taqeef.sharepoint.com/:w:/r/sites/Intranet/_layouts/15/Doc.aspx?sourcedoc=%7B${item.File.UniqueId.toUpperCase()}%7D&file=${filename}&action=default&mobileredirect=true`;                
              }
              if(extension == 'pdf'){
                FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/pdf.svg`;
                FileOpenPath = `${item.File.ServerRelativeUrl}`;
              }
              if(extension == 'xlsx'){
                FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/ExcelFluent.png`;
                FileOpenPath = `https://taqeef.sharepoint.com/:w:/r/sites/Intranet/_layouts/15/Doc.aspx?sourcedoc=%7B${item.File.UniqueId.toUpperCase()}%7D&file=${filename}&action=default&mobileredirect=true`;                
              }
              if(extension == 'pptx'){
                FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/PPTFluent.png`;
                FileOpenPath = `https://taqeef.sharepoint.com/:w:/r/sites/Intranet/_layouts/15/Doc.aspx?sourcedoc=%7B${item.File.UniqueId.toUpperCase()}%7D&file=${filename}&action=default&mobileredirect=true`;                
              }
              if(extension == 'url'){
                FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/URL.png`;
                FileOpenPath = `${item.File.ServerRelativeUrl}`;
              }
              if(extension == 'txt'){ 
                FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/txt.svg`;
                FileOpenPath = `${item.File.ServerRelativeUrl}`;
              }
              if(extension == 'css' || extension == 'sppkg' || extension == 'ts' || extension == 'tsx' || extension == 'html' || extension == 'aspx' || extension == 'ts' || extension == 'js' || extension == 'map' || extension == 'php' || extension == 'json' || extension == 'xml'){
                FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/Code.svg`;
                FileOpenPath = `${item.File.ServerRelativeUrl}`;
              }
              if(extension == 'png' || extension == 'PNG' || extension == 'JPG' || extension == 'JPEG'  || extension == 'SVG' || extension == 'svg' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif'){
                FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/photo.svg`;
                FileOpenPath = `${item.File.ServerRelativeUrl}`;
              }
              if(extension == "zip" || extension == "rar"){
                FileTypeImg=`${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/zip.svg`;
                FileOpenPath = `${item.File.ServerRelativeUrl}`;
              }
            return (        
              <tr>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.Division}</p>           
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.Section}</p>
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-emp-img">
                    <img src={`${FileTypeImg}`} alt="Company" />
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-title">
                    <a href={`${FileOpenPath}`} data-interception="off" target="_blank">{item.File.Name}</a>
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.ReleaseDate == null ? "" : moment(item.ReleaseDate).format("DD/MMM/YYYY")}</p>
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.Owner && item.Owner[0].Title}</p>
                  </div>
                </td>
                <td>
                  <div id={item.Id+"-DocumentType"}> 
                    
                  </div>
                </td>
              </tr>
            );
        }      
      }
      else{
          if(folder==1){
            return(      
            <tr>
              <td>
                <div className="widget-26-job-info">
                  <p className="type m-0">{item.Division}</p>            
                </div>
              </td>
              <td>
                <div className="widget-26-job-info">
                  <p className="type m-0">{item.Section}</p>
                </div>
              </td>
              <td>
                <div className="widget-26-job-emp-img">
                  <img src="https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/images/Folder.png" alt="Company" />
                </div>
              </td>
              <td>
                <div className="widget-26-job-title">
                <a href={`https://tmxin.sharepoint.com/${item.Folder.ServerRelativeUrl}`} data-interception="off" target="_blank">{item.Folder.Name}</a>
                </div>
              </td>
              <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.ReleaseDate == null ? "" : moment(item.ReleaseDate).format("DD/MMM/YYYY")}</p>
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.Owner && item.Owner[0].Title}</p>
                  </div>
                </td>
              <td>
                <div id={item.Id+"-DocumentType"}>
                  
                </div>
              </td>
            </tr>
            );
          }else{
            var FileTypeImg="";
            var filename=item.File.Name; 
            var Len = filename.length; 
            var Dot = filename.lastIndexOf(".");
            var extension = filename.substring(Dot+1, Len);

            if(extension == 'docx' || extension == 'doc'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/WordFluent.png`;  
              FileOpenPath = `https://taqeef.sharepoint.com/:w:/r/sites/Intranet/_layouts/15/Doc.aspx?sourcedoc=%7B${item.File.UniqueId.toUpperCase()}%7D&file=${filename}&action=default&mobileredirect=true`;                
            }
            if(extension == 'pdf'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/pdf.svg`;
              FileOpenPath = `${item.File.ServerRelativeUrl}`;
            }
            if(extension == 'xlsx'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/ExcelFluent.png`;
              FileOpenPath = `https://taqeef.sharepoint.com/:w:/r/sites/Intranet/_layouts/15/Doc.aspx?sourcedoc=%7B${item.File.UniqueId.toUpperCase()}%7D&file=${filename}&action=default&mobileredirect=true`;                
            }
            if(extension == 'pptx'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/PPTFluent.png`;
              FileOpenPath = `https://taqeef.sharepoint.com/:w:/r/sites/Intranet/_layouts/15/Doc.aspx?sourcedoc=%7B${item.File.UniqueId.toUpperCase()}%7D&file=${filename}&action=default&mobileredirect=true`;                
            }
            if(extension == 'url'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/URL.png`;
              FileOpenPath = `${item.File.ServerRelativeUrl}`;
            }
            if(extension == 'txt'){ 
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/txt.svg`;
              FileOpenPath = `${item.File.ServerRelativeUrl}`;
            }
            if(extension == 'css' || extension == 'sppkg' || extension == 'ts' || extension == 'tsx' || extension == 'html' || extension == 'aspx' || extension == 'ts' || extension == 'js' || extension == 'map' || extension == 'php' || extension == 'json' || extension == 'xml'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/Code.svg`;
              FileOpenPath = `${item.File.ServerRelativeUrl}`;
            }
            if(extension == 'png' || extension == 'PNG' || extension == 'JPG' || extension == 'JPEG'  || extension == 'SVG' || extension == 'svg' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif'){
              FileTypeImg = `${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/photo.svg`;
              FileOpenPath = `${item.File.ServerRelativeUrl}`;
            }
            if(extension == "zip" || extension == "rar"){
              FileTypeImg=`${reactHandler.props.siteurl}/SiteAssets/PublicSectionAsset%20(1)/images/FluentIcons/zip.svg`;
              FileOpenPath = `${item.File.ServerRelativeUrl}`;
            }
          return (        
            <tr>
              <td>
                <div className="widget-26-job-info">
                  <p className="type m-0">{item.Division}</p>           
                </div>
              </td>
              <td>
                <div className="widget-26-job-info">
                  <p className="type m-0">{item.Section}</p>
                </div>
              </td>
              <td>
                <div className="widget-26-job-emp-img">
                  <img src={`${FileTypeImg}`} alt="Company" />
                </div>
              </td>
              <td>
                <div className="widget-26-job-title">
                  <a href={`${FileOpenPath}`} data-interception="off" target="_blank">{item.File.Name}</a>
                </div>
              </td>
              <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.ReleaseDate == null ? "" : moment(item.ReleaseDate).format("DD/MMM/YYYY")}</p>
                  </div>
                </td>
                <td>
                  <div className="widget-26-job-info">
                    <p className="type m-0">{item.Owner && item.Owner[0].Title}</p>
                  </div>
                </td>
              <td>
                <div id={item.Id+"-DocumentType"}>
                
                </div>
              </td>
            </tr>
          );
        }     
      }  
    });

  return (
    <div className={ styles.publicSection }>
      <div className="container">
        <div className="bg user-images">
          <img src="https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/images/logo.png" alt="MicrosoftTeams-image" className="logo"/>
          <img src={`${this.state.CurrentUserProfilePic}`} onClick={()=>this.ShowUserDetailBlock()} alt="MicrosoftTeams-image" className="profile profile-picture"/>
          <div className="user-profile-details" onMouseLeave={()=>this.CloseUserDetailsBlock()}>
            <h3>  {this.state.CurrentUserName} </h3>  
            <p> {this.state.CurrentUserDesignation} </p>
            <div className="logou-bck">
              <a href="https://login.microsoftonline.com/common/oauth2/logout"><i className="fa fa-sign-out" aria-hidden="true"></i> Logout</a>
            </div>
          </div>
          <div className="centered">
            <h2 className="banner-title">Welcome to Taqeef's Public section</h2>
            <h4 className="banner-sub-text">Here you can find all types of documentations, guidelines and templates you need to excel at your work</h4>
            <div className="input-icons">         
              <i><img src="https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/images/search%20(6).svg" alt="MicrosoftTeams-image"/></i>
              <input className="input-field" placeholder="Search.." type="text" onChange={()=>this.ShowClear()}/>              
              <img className="close-icon unique-search-clr" onClick={()=>this.ClearSearchInput()} style={{display:"none"}} src="https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/images/clear-search.png" alt="clear"/>
              <button className={`${styles.button} search-btn`} onClick={()=>this.Search()}>Search</button>              
            </div>
          </div>
          <h6 className="err-msg"style={{display:"none",color:"red"}} id="txt-err-msg-search">Type something to search</h6>
        </div>
        <div className="body-container-wrap">
          <div className="content-heading">
            <h4 className="content-left f-left" style={{display:"none"}}>Browse By</h4>
            <h6 className="content-right"> Access the document repository <a href="https://taqeef.sharepoint.com/sites/Intranet/Policyandprocedures/Forms/AllItems.aspx" data-interception="off" target="_blank">here</a> </h6>
          </div>          

          <div className="recent-search" style={{display:"none"}}>
            <h4 className="content-left">Recent Searches</h4>
            <div className="row recent-search-box">
              {SearchResultJSX}                            
            </div>
          </div>

          <div className="m-t-10" id="doc-recent-viewed" style={{display:"none"}}>
            <h4 className="content-left">Recently Viewed Documents</h4>
            <div className="row document-view">
            {Recents}
            </div>
          </div>
          <div className="search-container-wrap m-t-20">
            <h4 className="content-left m-t-20">Search Results</h4>
              <div className="row m-t-20">
                <div className="col-12">
                  <div className="card card-margin">
                    <div className="card-body">
                      <div className="row search-body">
                        <div className="col-lg-12">
                          <div className="search-result">
                            <div className="result-header">
                              <div className="row m-t-10 result-count">
                                <div className="col-lg-6">
                                  <div className="records" style={{display:"none"}}><b>{this.state.ResultCount}</b> {this.state.ResultCount == 1 ? 'result found' : 'results found'}</div>
                                </div>
                                <div className="col-lg-6">
                                  <div className="result-actions">
                                    <div className="result-sorting">
                                      <select className="filter border-0" id="exampleOption-division" onChange={()=>this.masterfilter("Division")} title="Division">
                                      <option value="">-- Select Division --</option>                                      
                                        {DivisionOptions}
                                      </select>
                                      <i className="fa fa-close close-icon-division" onClick={()=>this.ClearFilterInput("Division")} style={{display:"none"}}></i>
                                    </div>
                                    <div className="result-sorting">
                                      <select className="filter border-0" id="exampleOption-section" onChange={()=>this.masterfilter("Section")} title="Section">
                                        <option value="">-- Select Section --</option>                                      
                                        {SectionOptions}
                                      </select>
                                      <i className="fa fa-close close-icon-section" onClick={()=>this.ClearFilterInput("Section")} style={{display:"none"}}></i>
                                    </div>
                                    <div className="result-sorting">                                                       
                                      <select className="filter border-0" id="exampleOption-doc-type" onChange={()=>this.masterfilter("DocType")} title="Document Type">
                                      <option value="">-- Select Document Type --</option>                                      
                                        {DocTypeOptions}
                                      </select>
                                      <i className="fa fa-close close-icon-doctype" onClick={()=>this.ClearFilterInput("DocType")} style={{display:"none"}}></i>
                                    </div>
                                    <div className="Filter-clear-master" style={{display:"none"}}>
                                      <button className="btn btn-primary" type="reset" id="btn-reset" onClick={()=>this.MasterFilterClear()}>Clear</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                                        
                            <div className="result-body">
                              <div className="table-responsive">
                                <table className="table widget-26">
                                  <thead>
                                    <tr>
                                      <th>Division</th>
                                      <th>Section</th>
                                      <th> <img src="https://taqeef.sharepoint.com/sites/Intranet/PublicSection/SiteAssets/PublicSectionAsset%20(1)/images/file%20(3).png" alt="Company" /></th>
                                      <th>Name</th>
                                      <th>Release Date</th>
                                      <th>Owner</th>
                                      <th>Document Type</th>
                                    </tr>
                                  </thead>
                                  <tbody>                                    
                                    {DocLibResult}                                    
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>                      
                      <nav className="d-flex justify-content-center pagination-wrap">
                        <ul id="numbers" className="pagination pagination-base pagination-boxed pagination-square mb-0">                          
                                                   
                        </ul>
                      </nav>
                    </div>
                    
                    <div className="err-wrp-msg">
                      <div id="no-result" className="no-result-err" style={{display:"none"}}><i className="fa fa-warning"></i><h6>No result found!!!</h6></div>
                      <div id="Search-err" className="no-result-err" style={{display:"none"}}><i className="fa fa-warning"></i><h6>Minimum 3 characters are required to search</h6></div>
                    </div>

                  </div>
                </div>
              </div>
            </div>  
          </div>
        </div>
      </div>
    );
  }
}
function displayRows(index) {
  var start = (index - 1) * rowsPerPage;
  var end = start + rowsPerPage;
  
  // Hide all rows.
  rows.hide();
  
  // Show the proper rows for this page.
  rows.slice(start, end).show();
}

