import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as IntlTelInput from 'intl-tel-input';

export class PhoneValidationPcf implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	// PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 
	private _notifyOutputChanged: () => void;
	private _errorMap: Array<string> = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];

	private _inputContainer: HTMLDivElement;
	private _phoneInput: HTMLInputElement;
	private _spanValid : HTMLSpanElement;
	private _spanInValid : HTMLSpanElement; 

	private _intlTelInputPlugin: IntlTelInput.Plugin;

	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this._notifyOutputChanged = notifyOutputChanged;

		this._phoneInput = document.createElement('input');
		this._phoneInput.setAttribute('type', 'text');
		this._phoneInput.addEventListener('change', this.onPhoneChange.bind(this));
		this._phoneInput.addEventListener('blur', this.onPhoneChange.bind(this));
		this._phoneInput.addEventListener('change', this.reset);
        this._phoneInput.addEventListener('keyup', this.reset);
		
		this._inputContainer = document.createElement("div");
		this._inputContainer.className = "phone-input-container";

		this._inputContainer.appendChild(this._phoneInput);
	

		this._spanValid = document.createElement("span");
		this._spanValid.setAttribute("class", "hide valid-valid-msg");
		this._spanValid.innerHTML = "✓ Valid"
		//this._spanValid.setAttribute("id","lblDays");


		this._spanInValid = document.createElement("span");
		this._spanInValid.setAttribute("class", "hide valid-error-msg");

		this._inputContainer.appendChild(this._spanValid);
		this._inputContainer.appendChild(this._spanInValid);
		
		container.appendChild(this._inputContainer);
		
		this._intlTelInputPlugin = IntlTelInput(this._phoneInput, {
			preferredCountries: ["ie", "gb"],
			allowDropdown: true
		});

		// NOTICE: has to load the utils.js in this way, as this component is initialized after window.load event, then utils.js defined in utilsScript option couldn't be loaded as expected.
		window.intlTelInputGlobals.loadUtils('https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/16.1.0/js/utils.js');
	}

	private onPhoneChange(event: Event): void {
		this.reset();

		if (this._phoneInput.value.trim()) {
			if (this._intlTelInputPlugin.isValidNumber()) {
				this._spanValid.classList.remove("hide");
			} else {
				this._phoneInput.classList.add("error");
				var errorCode = this._intlTelInputPlugin.getValidationError();
				this._spanInValid.innerHTML = this._errorMap[errorCode];
				this._spanInValid.classList.remove("hide");
			}
		}
		this._notifyOutputChanged();
	}

	private reset(): void{
		this._phoneInput.classList.remove("error");
		this._spanValid.classList.add("hide");
		this._spanInValid.innerHTML = "";
		this._spanInValid.classList.add("hide");
	};

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._intlTelInputPlugin.setNumber(context.parameters.Phone.raw!);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			Phone: this._intlTelInputPlugin.getNumber()
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}
}
