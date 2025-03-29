import React, { useEffect, useState } from "react";
import { MdVisibilityOff, MdVisibility } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";

const SigninDiv = ({ setCurrentUser, socket, setLogin, isSuper }) => {
  const navigate = useNavigate();

  const SignUpHandler = async () => {
    try {
      const response = await toast.promise(
        axios.post("http://localhost:5000/api/v1/adminSignUp", userDetails),
        {
          loading: "Signing up...",
          success: (data) => {
            localStorage.setItem("token", data.data.data.token);
            setCurrentUser(data.data.data);
            navigate(`/`);
            return "Sign up successful";
          },
          error: () => {
            setCurrentUser("");
            return "Sign up failed";
          },
        }
      );

      if (response) navigate("/");
    } catch (error) {
      const { response } = error;
      toast.error("An error occurred");
    }
  };

  const [userDetails, setUserDetails] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    CPassword: "",
    RememberMe: false,
    Districts: [], // Changed to array to store multiple districts
    SubDistricts: [], // Changed to array to store multiple subdistricts
    role: isSuper ? "super" : ""
  });

  const [pVisible, setPVisible] = useState({
    password: false,
    cpassword: false,
  });

  const [townTree, setTownTree] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState(""); // For temporary district selection
  const [availableSubDistricts, setAvailableSubDistricts] = useState([]); // Store available subdistricts based on selected districts

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/v1/fetchTownTree",
          {}
        );
        console.log(res);
        setTownTree(res.data.data.TownTree);
      } catch (err) {}
    };

    fetch();
  }, []);

  // Update available subdistricts when districts change
  useEffect(() => {
    let subDistricts = [];
    userDetails.Districts.forEach(district => {
      if (townTree[district]) {
        subDistricts = [...subDistricts, ...townTree[district]];
      }
    });
    setAvailableSubDistricts(subDistricts);
  }, [userDetails.Districts, townTree]);

  const changeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    
    if (type === "checkbox") {
      setUserDetails((state) => ({
        ...state,
        [name]: checked,
      }));
    } else {
      setUserDetails((state) => ({
        ...state,
        [name]: value,
      }));
    }
  };

  // Handle adding a district to the selection
  const addDistrict = () => {
    if (selectedDistrict && selectedDistrict !== "Select District" && !userDetails.Districts.includes(selectedDistrict)) {
      setUserDetails(prev => ({
        ...prev,
        Districts: [...prev.Districts, selectedDistrict],
        // Clear subdistricts when changing districts to prevent inconsistencies
        SubDistricts: []
      }));
      setSelectedDistrict("Select District");
    }
  };

  // Handle removing a district from selection
  const removeDistrict = (district) => {
    setUserDetails(prev => {
      const newDistricts = prev.Districts.filter(d => d !== district);
      
      // Update subdistricts to remove any that are no longer valid
      let validSubDistricts = [];
      newDistricts.forEach(d => {
        if (townTree[d]) {
          const districtSubdistricts = townTree[d];
          validSubDistricts = [...validSubDistricts, ...districtSubdistricts];
        }
      });
      
      const newSubDistricts = prev.SubDistricts.filter(sd => 
        validSubDistricts.includes(sd)
      );
      
      return {
        ...prev,
        Districts: newDistricts,
        SubDistricts: newSubDistricts
      };
    });
  };

  // Handle toggling a subdistrict selection
  const toggleSubDistrict = (subDistrict) => {
    setUserDetails(prev => {
      if (prev.SubDistricts.includes(subDistrict)) {
        return {
          ...prev,
          SubDistricts: prev.SubDistricts.filter(sd => sd !== subDistrict)
        };
      } else {
        return {
          ...prev,
          SubDistricts: [...prev.SubDistricts, subDistrict]
        };
      }
    });
  };

  // Select all subdistricts for the selected districts
  const selectAllSubDistricts = () => {
    setUserDetails(prev => ({
      ...prev,
      SubDistricts: [...availableSubDistricts]
    }));
  };

  // Clear all selected subdistricts
  const clearAllSubDistricts = () => {
    setUserDetails(prev => ({
      ...prev,
      SubDistricts: []
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: -100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 0, x: 100 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex justify-center items-center"
    >
      <div className="flex flex-col bg-white bg-opacity-30 text-black items-center shadow p-6 m-4 gap-2 py-4 rounded-xl min-w-[260px] w-[400px]">
        <div className="w-fit text-xl font-bold">Register Here</div>
        <div className="w-full">
          <p className="">Name</p>
          <input
            placeholder="Name"
            id="name"
            value={userDetails.name}
            name="name"
            onChange={changeHandler}
            className="px-2 py-1 bg-gray-100 text-black bg-opacity-30 rounded-lg shadow w-full"
          />
        </div>
        <div className="w-full">
          <p>Mobile No</p>
          <input
            placeholder="Mobile No"
            id="mobile"
            value={userDetails.mobile}
            name="mobile"
            onChange={changeHandler}
            className="px-2 py-1 bg-gray-100 text-black bg-opacity-30 rounded-lg shadow w-full"
          />
        </div>
        <div className="w-full">
          <p>Email</p>
          <input
            placeholder="Email Id"
            id="email"
            value={userDetails.email}
            name="email"
            onChange={changeHandler}
            className="px-2 py-1 bg-gray-100 text-black bg-opacity-30 rounded-lg shadow w-full"
          />
        </div>
        
        {/* Multi-Select Districts Section */}
        <div className="w-full">
          <p>Districts</p>
          <div className="flex gap-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-2 py-1 bg-gray-100 text-black bg-opacity-30 rounded-lg shadow flex-grow"
            >
              <option value="Select District">Select District</option>
              {Object.keys(townTree).map((district) => (
                <option 
                  key={district} 
                  value={district}
                  disabled={userDetails.Districts.includes(district)}
                >
                  {district}
                </option>
              ))}
            </select>
            <button
              onClick={addDistrict}
              className="bg-blue-500 text-white px-2 py-1 rounded-lg"
            >
              Add
            </button>
          </div>
          
          {/* Display selected districts */}
          {userDetails.Districts.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-semibold">Selected Districts:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {userDetails.Districts.map(district => (
                  <div key={district} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center text-sm">
                    {district}
                    <button 
                      onClick={() => removeDistrict(district)}
                      className="ml-2 text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Multi-Select SubDistricts Section */}
        <div className="w-full">
          <p>SubDistricts</p>
          {userDetails.Districts.length === 0 ? (
            <div className="px-2 py-1 bg-gray-100 rounded-lg shadow w-full text-gray-500">
              Please Select Districts First
            </div>
          ) : (
            <div>
              <div className="flex justify-between mb-2">
                <button 
                  onClick={selectAllSubDistricts} 
                  className="bg-blue-500 text-white px-2 py-1 rounded-lg text-sm"
                >
                  Select All
                </button>
                <button 
                  onClick={clearAllSubDistricts}
                  className="bg-gray-500 text-white px-2 py-1 rounded-lg text-sm"
                >
                  Clear All
                </button>
              </div>
              
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                {availableSubDistricts.map(subDistrict => (
                  <div key={subDistrict} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`subdistrict-${subDistrict}`}
                      checked={userDetails.SubDistricts.includes(subDistrict)}
                      onChange={() => toggleSubDistrict(subDistrict)}
                      className="mr-2"
                    />
                    <label htmlFor={`subdistrict-${subDistrict}`} className="text-sm">
                      {subDistrict}
                    </label>
                  </div>
                ))}
                {availableSubDistricts.length === 0 && (
                  <p className="text-gray-500 text-sm">No subdistricts available for selected districts</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full relative">
          <p>Password</p>
          <input
            placeholder="Password"
            type={pVisible.password ? "text" : "password"}
            id="password"
            value={userDetails.password}
            name="password"
            onChange={changeHandler}
            className="px-2 py-1 text-black bg-gray-100 bg-opacity-30 rounded-lg shadow w-full"
          />
          <label
            id="password"
            className="absolute cursor-pointer right-2 text-black top-8"
            onClick={() =>
              setPVisible((state) => ({
                ...state,
                password: !state.password
              }))
            }
          >
            {pVisible.password ? <MdVisibility /> : <MdVisibilityOff />}
          </label>
        </div>
        <div className="w-full relative">
          <p>Confirm Password</p>
          <input
            placeholder="Confirm Password"
            id="CPassword"
            type={pVisible.cpassword ? "text" : "password"}
            value={userDetails.CPassword}
            name="CPassword"
            onChange={changeHandler}
            className="px-2 py-1 text-black bg-gray-100 bg-opacity-30 rounded-lg shadow w-full"
          />
          <label
            id="cpassword"
            className="absolute cursor-pointer right-2 top-8 text-black"
            onClick={() =>
              setPVisible((state) => ({
                ...state,
                cpassword: !state.cpassword
              }))
            }
          >
            {pVisible.cpassword ? <MdVisibility /> : <MdVisibilityOff />}
          </label>
        </div>
        <div className="w-full">
          <label
            htmlFor="RememberMe"
            className="cursor-pointer select-none text-sm flex items-center gap-1 pl-2"
          >
            <input
              type="checkbox"
              id="RememberMe"
              name="RememberMe"
              checked={userDetails.RememberMe}
              onChange={changeHandler}
            />
            Remember Me
          </label>
        </div>
        <div
          onClick={SignUpHandler}
          className="w-fit text-center px-2 py-1 bg-green-500 shadow-inner cursor-pointer text-white rounded-xl transition-all duration-500 hover:bg-green-600 hover:scale-105"
        >
          SignUp
        </div>
        <div>
          Already have an account?{" "}
          <span
            onClick={() => setLogin((state) => !state)}
            className="text-orange-400 font-bold cursor-pointer"
          >
            LogIn Here
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SigninDiv;