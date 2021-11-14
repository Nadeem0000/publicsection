import * as React from 'react';
import styles from './PublicSection.module.scss';
import { IPublicSectionProps } from './IPublicSectionProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { Web } from "@pnp/sp/webs";
import { ServiceProvider } from './service/ServiceProvider';
import * as $ from "jquery";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";

SPComponentLoader.loadCss(`https://fonts.googleapis.com/css?family=Roboto:300,400,500,700`);           
SPComponentLoader.loadCss(`https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css`);   
SPComponentLoader.loadCss(`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css`); 
SPComponentLoader.loadCss(`https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/css/style.css`);
SPComponentLoader.loadCss(`https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/css/responsive.css`);


export interface IPublicSectionState {  
  Recentfile:any[];
  MasterSearchResult:any[];
  items:any[];
  DivisionArr:any[];
  Section:any[];
  DocType:any;
}  

let SerachResult=[];
let MasterArray=[];
let DivisionArr=[];
let Section=[];
let DocType=[];

const NewWeb = Web("https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/"); 

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
    DocType:[]
    }
  }

  componentDidMount(){
    this.GetRecentfile();
    this.getPublictSectionOptions();
  }
  
  public GetRecentfile(){
    this.serviceProvider.
      getMyDriveRecents()
        .then(
          (result: any[]): void => {          
            this.setState({ Recentfile: result });          
          }               
        )
        .catch(error => {
          console.log(error);
        });
  }
  
  public RecentSearch(){
    var query=this.state.MasterSearchResult;
    if($(".input-field").val()==query){
    }else{
    this.setState({MasterSearchResult:[]});
    var input=$(".input-field").val();
    if(input != ""){
      SerachResult.push(input);
      if(SerachResult.length > 3){
      SerachResult.shift();
  }
  this.setState({
    MasterSearchResult:SerachResult
  });
  }
  this.SearchResult();
  }
  }
  
  public SearchResult(){
    var query=$("#txt-search").val();
    console.log(query);
    var reactHandler = this;
    $.ajax({
      async: true,
      //url: `${reactHandler.props.siteurl}/_api/Web/Lists/getByTitle('Policy and procedures')/items?$expand=Folder,File&$select=Division,Name,Section,Title,FileRef,FileLeafRef,DocumentType&$filter=substringof('${query}','Title') or substringof('${query}',Division) or substringof('${query}',DocumentType) or substringof('${query}',Section)`,// URL to fetch data from sharepoint list                
      url: `${reactHandler.props.siteurl}/_api/Web/Lists/getByTitle('Policy and procedures')/items?$expand=Folder,File&$select=Division,Section,FileSystemObjectType&$filter=substringof('${query}',Division) or substringof('${query}',Section)`,// URL to fetch data from sharepoint list                
      method: "GET",
      headers: {
        "accept": "application/json;odata=verbose",
        "content-type": "application/json;odata=verbose"
      },
      success: function (resultData) {
  
        //console.log(resultData);
        if (resultData.d.results.length != 0) {
          $("#dynamic-null-gallery-handle").show();
          reactHandler.setState({
            items: resultData.d.results
          });
        }
        console.log(resultData.d.results);
        
      },
      error: function (error) {
        console.log(JSON.stringify(error));
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
      url: "https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/_api/web/lists/GetByTitle('Policy and procedures')/fields?$filter=EntityPropertyName eq 'Section' or EntityPropertyName eq 'Division'",
      type: "GET",
      headers: {
        "accept": "application/json;odata=verbose",
      },
      success: function (data) {    
        for(var j = 0; j < data.d.results.length; j++){ 
          if(data.d.results[j].InternalName == "Section"){                   
            for(var i = 0; i < data.d.results[j].Choices.results.length; i++){ 
              //ProductsArr.push({ value: ''+data.d.results[j].Choices.results[i]+'', label: ''+data.d.results[j].Choices.results[i]+''});
              Section.push(data.d.results[j].Choices.results[i]);
              //AllProductsArr.push({value:''+data.d.results[j].Choices.results[i]+'',label:''+data.d.results[j].Choices.results[i]+''});
            }                    
          }
          else if(data.d.results[j].InternalName == "Division"){                   
            for(var k = 0; k < data.d.results[j].Choices.results.length; k++){
              //DepartmentsArr.push({ value: ''+data.d.results[j].Choices.results[k]+'', label: ''+data.d.results[j].Choices.results[k]+''});
              DivisionArr.push(data.d.results[j].Choices.results[k]);
            }                   
          }
          
          else if(data.d.results[j].InternalName == "DocType"){                   
            for(var n = 0; n < data.d.results[j].Choices.results.length; n++){
              //TagsArr.push({ value: ''+data.d.results[j].Choices.results[n]+'', label: ''+data.d.results[j].Choices.results[n]+''});
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
  
  
  public masterfilter(){
    var query=$(".input-field").val();
    if(query==""){ 
      alert("empty");
      this.BeforeSearchFilterChange();
    }
    else{
      alert("somthing");
      this.AfterSearchFilterChnge();
    }
  }
  
  
  
  
  public AfterSearchFilterChnge(){ 
      var queryarr = [];  
      var filterquery;
      var QueryString = $("#txt-search").val(); 
      var Division=$("#Div-Option").val();
      var Section=$("#Sec-Option").val();
      var Type=$("#Type-Option").val();
       if(Division != "" && Division != 'undefined' && Division != null){
         //filterquery = `Department eq ${DefDepartment}`;
         queryarr.push(`Division eq '${Division}' and `);
       }
       if(Section != "" && Section != 'undefined' && Section != null){
         //filterquery = `Division eq ${DefDivision}`;
         queryarr.push(`Section eq '${Section}' and `);
       }
        filterquery = queryarr.join("");
      //  var reactHandler = this;
      //  $.ajax({
      //    async: true,
        
      //    url: `${reactHandler.props.siteurl}/_api/Web/Lists/getByTitle('Policy and procedures')/items?$expand=Folder,File&$select=Division,Section,DocumentType,FileSystemObjectType&$filter="${filterquery} substringof('${QueryString}',Division) or substringof('${QueryString}',Section)"`,// URL to fetch data from sharepoint list    or substringof('${QueryString}',DocumentType)              
      //    method: "GET",
      //    headers: {
      //      "accept": "application/json;odata=verbose",
      //      "content-type": "application/json;odata=verbose"
      //    },
      //    success: function (resultData) {
     
      //      //console.log(resultData);
      //      if (resultData.d.results.length != 0) {
      //        $("#dynamic-null-gallery-handle").show();
      //        reactHandler.setState({
      //          items: resultData.d.results
      //        });
      //      }
      //    },
      //    error: function (error) {
      //      console.log(JSON.stringify(error));
      //    }
      //  }); 
  
      NewWeb.lists.getByTitle("Policy and procedures").items.select("Division","Section","FileSystemObjectType").
      filter(""+filterquery+" substringof('" + QueryString + "',Division) or substringof('" +QueryString+ "',Section)").expand("File,Folder").get()
      .then((items)=>{
        if(items.length!=0){
          console.log(items);
          
        this.setState({items:items}); 
        }
      });
  
  
  
  
  
  
    }
  
    public BeforeSearchFilterChange(){
      var Globqueryarr = [];
      var filterquery;
      
      var Division=$("#Div-Option").val();
      var Section=$("#Sec-Option").val();
  
      if(Division != "" && Division != 'undefined' && Division != null){
        Globqueryarr.push(` Division eq '${Division}' `);
       }
       if(Section != "" && Section != 'undefined' && Section != null){
        Globqueryarr.push(` Section eq '${Section}' `);
       }
       filterquery = Globqueryarr.join(" and ");
      
       var reactHandler = this;
      //  $.ajax({
      //    async: true,
        
      //    url: `${reactHandler.props.siteurl}/_api/Web/Lists/getByTitle('Policy and procedures')/items?$expand=Folder,File&$select=Division,Section,FileSystemObjectType&$filter="${
      //      filterquery}"`,// URL to fetch data from sharepoint list                
      //    method: "GET",
      //    headers: {
      //      "accept": "application/json;odata=verbose",
      //      "content-type": "application/json;odata=verbose"
      //    },
      //    success: function (resultData) {
     
      //      //console.log(resultData);
      //      if (resultData.d.results.length != 0) {
      //        $("#dynamic-null-gallery-handle").show();
      //        reactHandler.setState({
      //          items: resultData.d.results
      //        });
      //      }
      //    },
      //    error: function (error) {
      //      console.log(JSON.stringify(error));
      //    }
      //  }); 
  
      NewWeb.lists.getByTitle("DefinitionsMaster").items.select("Division","Section","FileSystemObjectType").
      filter(""+filterquery+"").expand("File,Folder").get()
      .then((items)=>{
        if(items.length!=0){
        this.setState({items:items}); 
        }
      });
    }

  public render(): React.ReactElement<IPublicSectionProps> {
    var reactHandler = this;    
    const Recents: JSX.Element[] = reactHandler.state.Recentfile.map(function (item, key) {        
        var FileTypeImg="";
          var filename=item.name;                       
          var Len = filename.length; 
          var Dot = filename.lastIndexOf(".");
          var extension = filename.substring(Dot+1, Len);
          if(extension != "csv"){
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
                
              //    <div className="gallery">
              //    <a href={item.webUrl} data-interception="off" target="_blank">
              //     <img src={`${FileTypeImg}`} alt="Cinque Terre" width="600" height="400"/>
              //   </a>
              //   <div className="desc">
              //     <ul>
              //       {/*<li><img src={`${FileTypeImg}`}  className="document-image" alt="MicrosoftTeams-image"/></li>*/}
              //       <li className="document-name">{item.name}</li>
              //     </ul>
              //   </div>
              // </div>
              <div className="row document-view">
              <div className="col-md-2 gallery-width">
                <div className="card-gallery">
                  <img src={`${FileTypeImg}`} className="card-img-top" alt="..."/>
                  <div className="card-body">
                    <ul className="document-data">
                      {/* <li><img src={`${FileTypeImg}`} alt="MicrosoftTeams-image" className="document-image"/></li> */}
                      <li className="document-name">{item.name}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>






              );   
            }
          }
               
    });
      

    const SearchResultJSX: JSX.Element[] = reactHandler.state.MasterSearchResult.map(function (item, key) { 
      return (     
        <div className="recent-search">
        <h4 className="content-left">Recent Searches</h4>
        <div className="row recent-search-box">
          <div className="form-group col-lg-3">
            <div className="form-group has-feedback">
              
                <button>{item}</button>
                
              </div>
        </div>
        </div>
        </div>
      );        
    });

    const DivisionOptions: JSX.Element[] = this.state.DivisionArr.map(function(item,key) {
      return(
        <option value={item}>{item}</option>
      );
    });

    const SectionOptions: JSX.Element[] = this.state.Section.map(function(item,key) {
      return(
        <option value={item}>{item}</option>
      );
    });

    const DocTypeOptions: JSX.Element[] = this.state.DocType.map(function(item,key) {
      return(
        <option value={item}>{item}</option>
      );
    });

    const DocLibResult: JSX.Element[] = reactHandler.state.items.map(function (item, key) { 
      var folder=item.FileSystemObjectType;
      if(folder==1)
      {
        return(
      //   <tr>
      //   <td>
      //     <div className="widget-26-job-info">
      //         <p className="type m-0">{item.Division}</p>
             
      //     </div>
      // </td>
      //     <td>
      //         <div className="widget-26-job-info">
      //             <p className="type m-0">{item.Section}</p>
      //         </div>
      //     </td>
      //     <td>
      //         <div className="widget-26-job-emp-img">
      //             <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/folder.jpg" alt="Company" />
      //         </div>
      //     </td>
      //     <td>
      //         <div className="widget-26-job-title">
      //             <a href={`${reactHandler.props.siteurl}${item.Folder.ServerRelativeUrl}`}>{item.Folder.Name}</a>
      //         </div>
      //     </td>
      //     <td>
      //           <div>
      //         <h6 className="badge badge-primary">{/*item.Folder.DocumentType*/}</h6>
      //             </div>
      //           </td>
      // </tr>




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
                <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/folder.jpg" alt="Company" />
            </div>
        </td>
        <td>
            <div className="widget-26-job-title">
                <a href={`${reactHandler.props.siteurl}${item.Folder.ServerRelativeUrl}`}>{item.Folder.Name}</a>
            </div>
        </td>
        <td>
            <div>
              <h6 className="badge badge-primary">policy</h6>
              <h6 className="badge badge-success">process</h6>
              <h6 className="badge badge-dark">Authority matrix</h6>
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
      return (  
      //   <tr>
      //   <td>
      //     <div className="widget-26-job-info">
      //         <p className="type m-0">{item.Division}</p>
             
      //     </div>
      // </td>
      //     <td>
      //         <div className="widget-26-job-info">
      //             <p className="type m-0">{item.Section}</p>
      //         </div>
      //     </td>
      //     <td>
      //         <div className="widget-26-job-emp-img">
      //             <img src={`${FileTypeImg}`}alt="Company" />
      //         </div>
      //     </td>
      //     <td>
      //         <div className="widget-26-job-title">
      //             <a href={`${reactHandler.props.siteurl}${item.File.ServerRelativeUrl}`}>{item.File.Name}</a>
      //         </div>
      //     </td>
      //     <td>
      //         <div>
      //         <h6 className="badge badge-primary">{/*item.Folder.DocumentType*/}</h6>
      //         </div>
      //     </td>
      // </tr>   


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
                <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/folder.jpg" alt="Company" />
            </div>
        </td>
        <td>
            <div className="widget-26-job-title">
                <a href={`${reactHandler.props.siteurl}${item.File.ServerRelativeUrl}`}>{item.File.Name}</a>
            </div>
        </td>
        <td>
            <div>
              <h6 className="badge badge-primary">policy</h6>
              <h6 className="badge badge-success">process</h6>
              <h6 className="badge badge-dark">Authority matrix</h6>
            </div>
        </td>
       </tr>



      );
   }        
    });

    return (
          <div className={ styles.publicSection }>
         <div className="container">
    <div className="bg">
    <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/logo.png" alt="MicrosoftTeams-image" className="logo"/>
          <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/Mask Group 51.png" alt="MicrosoftTeams-image" className="profile"/>
      <div className="centered">
        <h2 className="banner-title">Welcome to Taqeef's Public section</h2>
        <h4 className="banner-sub-text">Here you can find all types of documentation, guidelines and templates you need to
          excel at your work</h4>
        <div className="input-icons">         
          <i><img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/search%20(6).svg" alt="MicrosoftTeams-image"/></i>
          <input className="input-field" placeholder="Search.." type="text"/>
          <button className={styles.button} onClick={()=>this.RecentSearch()}>Search</button>
        </div>
      </div>
    </div>
    <div className="body-container-wrap">
      <div className="content-heading">
        <h4 className="content-left f-left">Browse By</h4>
        <h6 className="content-right"> Access the document repository <a href="#">here</a> </h6>
      </div>
      <div className="row card-row">
        <div className="col-md-4 card-wrap">
          <div className="two-blocks">
            <div className="three-blocks-desc">
              <p className="draft-card-detail-1">Policies &amp; Procedures</p>
              <p className="draft-card-detail-2">215 Files</p>
            </div>
            <div className="two-blocks-img">
              <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/Group%2034.png" alt="image" className="delete-img"/>             
            </div>
          </div>
        </div>
        <div className="col-md-4 card-wrap">
          <div className="two-blocks">
            <div className="three-blocks-desc">
              <p className="draft-card-detail-1">Templates &amp; Guidelines</p>
              <p className="draft-card-detail-2">125 Files</p>
            </div>
            <div className="two-blocks-img">
              <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/Group%2029.png" alt="image" className="delete-img"/>              
            </div>
          </div>

        </div>
        <div className="col-md-4 card-wrap">
          <div className="two-blocks">
            <div className="three-blocks-desc">
              <p className="draft-card-detail-1">KPIs &amp; SLAs</p>
              <p className="draft-card-detail-2">80 Files</p>
            </div>
            <div className="two-blocks-img">
              <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/Group%2035.png" alt="image" className="delete-img"/>
            </div>
          </div>

        </div>
      </div>

      <div className="recent-search">
        <h4 className="content-left">Recent Searches</h4>
        <div className="row recent-search-box">
          <div className="form-group col-lg-3">
            <div className="form-group has-feedback">
              <input type="text" className="form-control" placeholder="BrowserMedia Contract" />
              <span className="search-icon form-control-feedback"><img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/search%20(6).svg"
                  alt="MicrosoftTeams-image"/></span>
              <span className="form-control-feedback"><img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/close%20(3).svg" alt="MicrosoftTeams-image"/></span>
            </div>
          </div>
          <div className="form-group col-lg-3">
            <div className="form-group has-feedback">
              <input type="text" className="form-control" placeholder="BrowserMedia Contract" />
              <span className="search-icon form-control-feedback">
                <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/search%20(6).svg"
                  alt="MicrosoftTeams-image"/></span>
              <span className="form-control-feedback"><img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/close%20(3).svg" alt="MicrosoftTeams-image"/></span>
            </div>
          </div>
          <div className="form-group col-lg-3">
            <div className="form-group has-feedback">
              <input type="text" className="form-control" placeholder="BrowserMedia Contract" />
              <span className="search-icon form-control-feedback"><img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/search%20(6).svg"
                  alt="MicrosoftTeams-image"/></span>
              <span className="form-control-feedback"><img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/close%20(3).svg" alt="MicrosoftTeams-image"/></span>
            </div>
          </div>
        </div>
      </div>

      <div className="m-t-10">
        <h4 className="content-left">Recent Viewed Docoments</h4>
        {Recents}
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
                                            <div className="row m-t-10">
                                                <div className="col-lg-6">
                                                    <div className="records">Showing: <b>1-20</b> of <b>200</b> result</div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="result-actions">
                                                        <div className="result-sorting">
                                                            
                                                            <select className="filter border-0" id="exampleOption">
                                                                <option value="1">Relevance</option>
                                                                <option value="2">Names (A-Z)</option>
                                                                <option value="3">Names (Z-A)</option>
                                                            </select>
                                                        </div>
                                                        <div className="result-sorting">
                                                        
                                                          <select className="filter border-0" id="exampleOption">
                                                              <option value="1">Relevance</option>
                                                              <option value="2">Names (A-Z)</option>
                                                              <option value="3">Names (Z-A)</option>
                                                          </select>
                                                      </div>
                                                      <div className="result-sorting">
                                                       
                                                        <select className="filter border-0" id="exampleOption">
                                                            <option value="1">Relevance</option>
                                                            <option value="2">Names (A-Z)</option>
                                                            <option value="3">Names (Z-A)</option>
                                                        </select>
                                                    </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="result-body">
                                            <div className="table-responsive">
                                                <table className="table widget-26">
                                                    <tbody>
                                                      <tr>
                                                      <th>Division</th>
                                                      <th>Section</th>
                                                      <th> <img src="https://tmxin.sharepoint.com/sites/POC/taqeefIntranet/SiteAssets/PublicSectionAsset%20(1)/images/file (3).png" alt="Company" /></th>
                                                      <th>Name</th>
                                                      <th>Document Type</th>
                                                    </tr>
                                                    {DocLibResult}
                                                        </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <nav className="d-flex justify-content-center">
                                <ul className="pagination pagination-base pagination-boxed pagination-square mb-0">
                                    <li className="page-item">
                                        <a className="page-link no-border" href="#">
                                            <span aria-hidden="true">«</span>
                                            <span className="sr-only">Previous</span>
                                        </a>
                                    </li>
                                    <li className="page-item active"><a className="page-link no-border" href="#">1</a></li>
                                    <li className="page-item"><a className="page-link no-border" href="#">2</a></li>
                                    <li className="page-item"><a className="page-link no-border" href="#">3</a></li>
                                    <li className="page-item"><a className="page-link no-border" href="#">4</a></li>
                                    <li className="page-item">
                                        <a className="page-link no-border" href="#">
                                            <span aria-hidden="true">»</span>
                                            <span className="sr-only">Next</span>
                                        </a>
                                    </li>
                                </ul>
                            </nav>
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
